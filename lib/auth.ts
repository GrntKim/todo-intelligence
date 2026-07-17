import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated Supabase user's id, or redirects to /login.
 * Every server action and page that touches user data must go through this —
 * Prisma connects as the postgres role and bypasses RLS, so scoping queries
 * by this id is the only ownership check we have.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  return user.id;
}
