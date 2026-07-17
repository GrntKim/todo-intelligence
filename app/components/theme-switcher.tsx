"use client";

import { useTransition } from "react";
import { setTheme } from "@/app/actions/theme";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Theme } from "@/lib/theme";

function ThemeIcon({ theme }: { theme: Theme }) {
  if (theme === "light") {
    return (
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
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (theme === "dark") {
    return (
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>
    );
  }
  return (
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
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function resolveIsDark(theme: Theme): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeSwitcher({
  current,
  dict,
}: {
  current: Theme;
  dict: Dictionary["themeSwitcher"];
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5 text-black/60 dark:text-white/60">
      <ThemeIcon theme={current} />
      <select
        aria-label={dict.label}
        value={current}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Theme;
          // Apply immediately so the toggle feels instant instead of
          // waiting on the round trip that persists the cookie.
          document.documentElement.classList.toggle("dark", resolveIsDark(next));
          startTransition(() => {
            setTheme(next);
          });
        }}
        className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm text-foreground disabled:opacity-50 dark:border-white/20"
      >
        <option value="light">{dict.light}</option>
        <option value="dark">{dict.dark}</option>
        <option value="system">{dict.system}</option>
      </select>
    </div>
  );
}
