import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import { getTheme } from "@/lib/theme";
import LanguageSwitcher from "@/app/components/language-switcher";
import ThemeSwitcher from "@/app/components/theme-switcher";

export default async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email as string | undefined;
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const theme = await getTheme();

  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold">
          todo-intelligence
        </Link>
        <div className="flex items-center gap-4">
          {email && (
            <span className="text-sm text-black/60 dark:text-white/60">
              {email}
            </span>
          )}
          <ThemeSwitcher current={theme} dict={dict.themeSwitcher} />
          <LanguageSwitcher current={locale} dict={dict.languageSwitcher} />
        </div>
      </div>
    </header>
  );
}
