import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary, getLocale } from "@/lib/i18n/locale";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/");

  const dict = getDictionary(await getLocale());

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <LoginForm dict={dict.auth} />
    </main>
  );
}
