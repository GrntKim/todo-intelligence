"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions/auth";

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <h1 className="text-2xl font-semibold">
        {mode === "signin" ? "로그인" : "회원가입"}
      </h1>

      <label className="flex flex-col gap-1 text-sm">
        이메일
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        비밀번호
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
        {pending ? "처리 중…" : mode === "signin" ? "로그인" : "가입하기"}
      </button>

      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-black/60 underline dark:text-white/60"
      >
        {mode === "signin"
          ? "계정이 없나요? 회원가입"
          : "이미 계정이 있나요? 로그인"}
      </button>
    </form>
  );
}
