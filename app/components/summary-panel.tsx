"use client";

import { useState, useTransition } from "react";
import { summarizeTodos, type TodoSummary } from "@/app/actions/summarize";
import type { SummaryPeriod } from "@/lib/prompts/summary";
import { formatDateTime } from "@/lib/format";

export type SummaryView = TodoSummary & { requestedAt: string };
export type InitialSummaries = Partial<Record<SummaryPeriod, SummaryView>>;

const PERIOD_TABS: { value: SummaryPeriod; label: string }[] = [
  { value: "day", label: "일" },
  { value: "week", label: "주" },
];

// Model output may contain markdown bold markers — render them as <strong>
// without pulling in a markdown library.
function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

export default function SummaryPanel({
  initialSummaries,
}: {
  initialSummaries: InitialSummaries;
}) {
  const [period, setPeriod] = useState<SummaryPeriod>("day");
  const [summaries, setSummaries] = useState<InitialSummaries>(initialSummaries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = summaries[period];

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await summarizeTodos(period);
      if (result.ok) {
        setSummaries((prev) => ({ ...prev, [period]: result.data }));
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <aside className="flex h-fit flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">AI 요약</h2>
        <div
          role="tablist"
          aria-label="요약 기간"
          className="flex rounded border border-black/15 text-sm dark:border-white/20"
        >
          {PERIOD_TABS.map((tab) => (
            <button
              key={tab.value}
              role="tab"
              aria-selected={period === tab.value}
              onClick={() => {
                setPeriod(tab.value);
                setError(null);
              }}
              className={`px-3 py-1 first:rounded-l last:rounded-r ${
                period === tab.value
                  ? "bg-foreground font-medium text-background"
                  : "text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {isPending
          ? "요약 생성 중…"
          : `${period === "day" ? "하루" : "일주일"} 요약 생성`}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {current ? (
        <div
          className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-50" : ""}`}
        >
          <p className="text-sm leading-relaxed">{renderBold(current.summary)}</p>
          <div className="rounded border border-black/10 bg-black/[.03] px-3 py-2 dark:border-white/15 dark:bg-white/[.06]">
            <p className="text-xs font-medium text-black/50 dark:text-white/50">
              조언
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {renderBold(current.advice)}
            </p>
          </div>
          <time
            suppressHydrationWarning
            className="text-xs text-black/40 dark:text-white/40"
          >
            생성: {formatDateTime(current.requestedAt)}
          </time>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-black/40 dark:text-white/40">
          아직 요약이 없습니다. 위 버튼으로 생성해보세요.
        </p>
      )}
    </aside>
  );
}
