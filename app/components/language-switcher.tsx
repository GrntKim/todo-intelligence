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
      className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm disabled:opacity-50 dark:border-white/20"
    >
      <option value="ko">{dict.ko}</option>
      <option value="en">{dict.en}</option>
    </select>
  );
}
