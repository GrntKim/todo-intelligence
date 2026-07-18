"use client";

import { useActionState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export default function AuthForm({
  mode,
  dict,
  onSwitchMode,
}: {
  mode: "signin" | "signup";
  dict: Dictionary["auth"];
  onSwitchMode: () => void;
}) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        {mode === "signin" ? dict.signIn : dict.signUp}
      </h1>

      <label className="flex flex-col gap-1 text-sm">
        {dict.email}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        {dict.password}
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-foreground px-4 py-2 font-medium text-background disabled:opacity-50"
      >
        {pending ? dict.submitPending : mode === "signin" ? dict.submitSignIn : dict.submitSignUp}
      </button>

      <button
        type="button"
        onClick={onSwitchMode}
        className="text-sm text-black/60 underline dark:text-white/60"
      >
        {mode === "signin" ? dict.switchToSignUp : dict.switchToSignIn}
      </button>
    </form>
  );
}
