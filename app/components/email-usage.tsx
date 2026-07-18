"use client";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { SummaryUsage } from "@/lib/summary-usage";

export default function EmailUsage({
  email,
  usage,
  dict,
}: {
  email: string;
  usage: SummaryUsage;
  dict: Dictionary["emailUsage"];
}) {
  return (
    <div className="group relative">
      <span className="cursor-default text-sm text-black/60 dark:text-white/60">
        {email}
      </span>
      <div className="invisible absolute right-0 top-full z-10 mt-2 w-48 rounded border border-black/15 bg-background p-3 text-sm text-foreground opacity-0 shadow-md transition-opacity group-hover:visible group-hover:opacity-100 dark:border-white/20">
        <div className="flex justify-between gap-2">
          <span>{dict.dailyLabel}</span>
          <span>
            {usage.daily.used}/{usage.daily.limit}
          </span>
        </div>
        <div className="mt-1 flex justify-between gap-2">
          <span>{dict.weeklyLabel}</span>
          <span>
            {usage.weekly.used}/{usage.weekly.limit}
          </span>
        </div>
      </div>
    </div>
  );
}
