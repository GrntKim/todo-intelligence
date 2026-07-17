import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email as string | undefined;

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div
        className={`mx-auto flex w-full max-w-5xl items-center p-4 ${
          email ? "justify-between" : "justify-center"
        }`}
      >
        <Link href="/" className="text-xl font-bold">
          todo.ai
        </Link>
        {email && (
          <span className="text-sm text-black/60 dark:text-white/60">
            {email}
          </span>
        )}
      </div>
    </header>
  );
}
