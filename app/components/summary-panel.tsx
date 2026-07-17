"use client";

import { useState, useTransition } from "react";
import type { Todo } from "@prisma/client";
import { summarizeTodos, type TodoSummary } from "@/app/actions/summarize";
import type { SummaryPeriod } from "@/lib/prompts/summary";
import { formatDateTime } from "@/lib/format";
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries";
import {
  seoulDateLabel,
  seoulDayRange,
  seoulWeekEnd,
  seoulWeekStart,
} from "@/lib/seoul-time";

export type SummaryView = TodoSummary & { requestedAt: string };
export type InitialSummaries = Partial<Record<SummaryPeriod, SummaryView>>;

// Model output may contain markdown bold markers — render them as <strong>
// without pulling in a markdown library.
function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

export default function SummaryPanel({
  initialSummaries,
  todos,
  now,
  locale,
}: {
  initialSummaries: InitialSummaries;
  todos: Todo[];
  now: number; // server render time — keeps render pure and hydration consistent
  locale: Locale;
}) {
  const dict = dictionaries[locale].summary;
  const PERIOD_TABS: { value: SummaryPeriod; label: string }[] = [
    { value: "day", label: dict.dayTab },
    { value: "week", label: dict.weekTab },
  ];
  const [period, setPeriod] = useState<SummaryPeriod>("day");
  const [summaries, setSummaries] = useState<InitialSummaries>(initialSummaries);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const current = summaries[period];

  // Same calendar-based membership rule the summarize action applies
  // server-side: day = due falls exactly on today (Seoul), no undated todos;
  // week = due any time through this Sunday (Seoul), undated todos included.
  const nowDate = new Date(now);
  const periodTodos = todos.filter((t) => {
    if (t.completed) return false;
    if (period === "day") {
      if (t.due === null) return false;
      const { start, end } = seoulDayRange(nowDate);
      const dueTime = new Date(t.due).getTime();
      return dueTime >= start.getTime() && dueTime <= end.getTime();
    }
    return t.due === null || new Date(t.due).getTime() <= seoulWeekEnd(nowDate).getTime();
  });

  const periodRangeLabel =
    period === "day"
      ? seoulDateLabel(nowDate)
      : `${seoulDateLabel(seoulWeekStart(nowDate))} ~ ${seoulDateLabel(seoulWeekEnd(nowDate))}`;

  function handleGenerate() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await summarizeTodos(period);
      if (result.ok) {
        setSummaries((prev) => ({ ...prev, [period]: result.data }));
        if (result.cached) {
          setInfo(dict.cachedNotice);
        }
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <aside className="flex h-fit flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{dict.heading}</h2>
        <div
          role="tablist"
          aria-label={dict.periodTabsLabel}
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
                setInfo(null);
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

      <p
        suppressHydrationWarning
        className="text-xs text-black/50 dark:text-white/50"
      >
        {periodRangeLabel}
      </p>

      <div suppressHydrationWarning>
        <p className="text-xs font-medium text-black/50 dark:text-white/50">
          {dict.todoCount(periodTodos.length)}
        </p>
        {periodTodos.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1">
            {periodTodos.map((todo) => {
              const overdue =
                todo.due !== null && new Date(todo.due).getTime() < now;
              return (
                <li
                  key={todo.id}
                  className="flex items-baseline justify-between gap-2 text-sm"
                >
                  <span className="truncate">{todo.title}</span>
                  {todo.due && (
                    <time
                      suppressHydrationWarning
                      className={`shrink-0 text-xs ${
                        overdue
                          ? "font-medium text-red-600 dark:text-red-400"
                          : "text-black/40 dark:text-white/40"
                      }`}
                    >
                      {formatDateTime(todo.due)}
                    </time>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isPending}
        className="rounded bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {isPending ? dict.generating : dict.generate(period)}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}

      {info && (
        <p
          role="status"
          className="rounded border border-black/10 bg-black/[.03] px-3 py-2 text-sm text-black/60 dark:border-white/15 dark:bg-white/[.06] dark:text-white/60"
        >
          {info}
        </p>
      )}

      {current ? (
        <div
          className={`flex flex-col gap-3 transition-opacity ${isPending ? "opacity-50" : ""}`}
        >
          <p className="text-sm leading-relaxed">{renderBold(current.summary)}</p>
          <div className="rounded border border-black/10 bg-black/[.03] px-3 py-2 dark:border-white/15 dark:bg-white/[.06]">
            <p className="text-xs font-medium text-black/50 dark:text-white/50">
              {dict.adviceLabel}
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              {renderBold(current.advice)}
            </p>
          </div>
          <time
            suppressHydrationWarning
            className="text-xs text-black/40 dark:text-white/40"
          >
            {dict.generatedAtLabel}: {formatDateTime(current.requestedAt)}
          </time>
        </div>
      ) : (
        <p className="py-6 text-center text-sm text-black/40 dark:text-white/40">
          {dict.empty}
        </p>
      )}
    </aside>
  );
}
