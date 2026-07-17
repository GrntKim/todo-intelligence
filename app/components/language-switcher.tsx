"use client";

import { useTransition } from "react";
import { setLocale } from "@/app/actions/locale";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export default function LanguageSwitcher({
  current,
  dict,
}: {
  current: Locale;
  dict: Dictionary["languageSwitcher"];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5 text-black/60 dark:text-white/60">
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
      </svg>
      <select
        aria-label={dict.label}
        value={current}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => {
            setLocale(next);
          });
        }}
        className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm text-foreground disabled:opacity-50 dark:border-white/20"
      >
        <option value="ko">{dict.ko}</option>
        <option value="en">{dict.en}</option>
      </select>
    </div>
  );
}
