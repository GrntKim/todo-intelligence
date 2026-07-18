"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import AuthForm from "./auth-form";

export default function LoginForm({ dict }: { dict: Dictionary["auth"] }) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <AuthForm
      key={mode}
      mode={mode}
      dict={dict}
      onSwitchMode={() => setMode(mode === "signin" ? "signup" : "signin")}
    />
  );
}
