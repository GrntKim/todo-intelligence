"use server";

import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth";
import {
  buildSummaryUserPrompt,
  SUMMARY_OUTPUT_SCHEMA,
  SUMMARY_SYSTEM_PROMPT,
  type SummaryPeriod,
} from "@/lib/prompts/summary";
import {
  summaryFingerprint,
  type FingerprintTodo,
} from "@/lib/summary-fingerprint";
import { seoulDayRange, seoulWeekEnd } from "@/lib/seoul-time";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { getSummaryUsage } from "@/lib/summary-usage";

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
  const locale = await getLocale();
  const { errors } = getDictionary(locale).summary;

  if (period !== "day" && period !== "week") {
    return { ok: false, error: errors.invalidPeriod };
  }

  const now = new Date();

  // Calendar-based periods in Seoul time. Day: due must fall exactly on
  // today's date, and undated todos are excluded. Week: due any time up
  // through this Sunday (no lower bound, so anything overdue from before
  // this week still surfaces), undated todos included.
  // userId filter is mandatory in both — Prisma bypasses RLS.
  const dayRange = seoulDayRange(now);
  const todos = await prisma.todo.findMany({
    where:
      period === "day"
        ? {
            userId,
            completed: false,
            due: { gte: dayRange.start, lte: dayRange.end },
          }
        : {
            userId,
            completed: false,
            OR: [{ due: null }, { due: { lte: seoulWeekEnd(now) } }],
          },
    orderBy: { due: "asc" },
    select: { id: true, title: true, content: true, due: true },
  });

  if (todos.length === 0) {
    return { ok: false, error: errors.noTodos };
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

  const { daily, weekly } = await getSummaryUsage(userId);
  if (daily.used >= daily.limit) {
    return { ok: false, error: errors.dailyLimitExceeded };
  }
  if (weekly.used >= weekly.limit) {
    return { ok: false, error: errors.weeklyLimitExceeded };
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
      return { ok: false, error: errors.noText };
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
      return { ok: false, error: errors.authFailed };
    }
    if (error instanceof Anthropic.RateLimitError) {
      console.error("summarizeTodos: rate limited", error.message);
      return { ok: false, error: errors.rateLimited };
    }
    if (error instanceof Anthropic.APIConnectionError) {
      console.error("summarizeTodos: connection/timeout error", error.message);
      return { ok: false, error: errors.timeout };
    }
    if (error instanceof Anthropic.APIError) {
      console.error("summarizeTodos: API error", error.status, error.message);
      return { ok: false, error: errors.apiFailed };
    }
    console.error("summarizeTodos: unexpected error", error);
    return { ok: false, error: errors.unexpected };
  }
}
