"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import {
  buildSummaryUserPrompt,
  PERIOD_MS,
  SUMMARY_OUTPUT_SCHEMA,
  SUMMARY_SYSTEM_PROMPT,
  type SummaryPeriod,
} from "@/lib/prompts/summary";
import {
  summaryFingerprint,
  type FingerprintTodo,
} from "@/lib/summary-fingerprint";

export type TodoSummary = {
  period: string;
  summary: string;
  advice: string;
};

export type SummarizeResult =
  | { ok: true; data: TodoSummary & { requestedAt: string }; cached?: boolean }
  | { ok: false; error: string };

// Server-only: the API key never reaches the client — this module is
// 'use server' and the key is read from a non-NEXT_PUBLIC env var.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 30_000, // 30s (TypeScript SDK timeouts are in milliseconds)
});

export async function summarizeTodos(
  period: SummaryPeriod,
): Promise<SummarizeResult> {
  const userId = await requireUserId();

  if (period !== "day" && period !== "week") {
    return { ok: false, error: "기간은 하루 또는 일주일만 선택할 수 있습니다." };
  }

  const now = new Date();
  const periodEnd = new Date(now.getTime() + PERIOD_MS[period]);

  // Incomplete todos due within the period (including overdue) or with no due
  // date. userId filter is mandatory — Prisma bypasses RLS.
  const todos = await prisma.todo.findMany({
    where: {
      userId,
      completed: false,
      OR: [{ due: null }, { due: { lte: periodEnd } }],
    },
    orderBy: { due: "asc" },
    select: { id: true, title: true, content: true, due: true },
  });

  if (todos.length === 0) {
    return { ok: false, error: "요약할 미완료 할 일이 없습니다." };
  }

  // Dedup guard: if the exact same todos (including overdue state) were
  // already summarized by the latest stored summary for this user+period,
  // reuse it instead of spending another API call.
  const latest = await prisma.summary.findFirst({
    where: { userId, period },
    orderBy: { requestedAt: "desc" },
    select: { summary: true, todos: true, requestedAt: true },
  });
  if (
    latest &&
    summaryFingerprint(todos, now) ===
      summaryFingerprint(latest.todos as FingerprintTodo[], latest.requestedAt)
  ) {
    return {
      ok: true,
      cached: true,
      data: {
        ...(latest.summary as TodoSummary),
        requestedAt: latest.requestedAt.toISOString(),
      },
    };
  }

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: buildSummaryUserPrompt(period, todos, now) },
      ],
      output_config: {
        format: { type: "json_schema", schema: SUMMARY_OUTPUT_SCHEMA },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) {
      console.error("summarizeTodos: no text block", response.stop_reason);
      return { ok: false, error: "요약 결과를 받지 못했습니다. 다시 시도해주세요." };
    }

    const parsed = JSON.parse(textBlock.text) as { result: TodoSummary };

    // Persist the summary with a snapshot of the todos it covered.
    // Best-effort: the AI call already succeeded, so a failed write is only
    // logged — the user still gets their summary.
    try {
      await prisma.summary.create({
        data: {
          userId,
          period,
          summary: parsed.result,
          todos: todos.map((t) => ({
            id: t.id,
            title: t.title,
            content: t.content,
            due: t.due ? t.due.toISOString() : null,
          })),
          requestedAt: now,
        },
      });
    } catch (persistError) {
      console.error("summarizeTodos: failed to persist summary", persistError);
    }

    return { ok: true, data: { ...parsed.result, requestedAt: now.toISOString() } };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("summarizeTodos: authentication error", error.message);
      return { ok: false, error: "AI 서비스 인증에 실패했습니다. 관리자에게 문의해주세요." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      console.error("summarizeTodos: rate limited", error.message);
      return { ok: false, error: "요청이 많습니다. 잠시 후 다시 시도해주세요." };
    }
    if (error instanceof Anthropic.APIConnectionError) {
      console.error("summarizeTodos: connection/timeout error", error.message);
      return { ok: false, error: "요약 요청이 시간을 초과했습니다. 잠시 후 다시 시도해주세요." };
    }
    if (error instanceof Anthropic.APIError) {
      console.error("summarizeTodos: API error", error.status, error.message);
      return { ok: false, error: "요약 생성에 실패했습니다. 잠시 후 다시 시도해주세요." };
    }
    console.error("summarizeTodos: unexpected error", error);
    return { ok: false, error: "요약 생성 중 문제가 발생했습니다. 다시 시도해주세요." };
  }
}
