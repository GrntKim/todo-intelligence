import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the authenticated Supabase user's id, or redirects to /login.
 * Every server action and page that touches user data must go through this —
 * Prisma connects as the postgres role and bypasses RLS, so scoping queries
 * by this id is the only ownership check we have.
 *
 * Uses getClaims() instead of getUser(): the JWT is verified locally
 * (against the project's public signing keys) rather than with a network
 * round trip to the Auth server on every request. Token refresh is already
 * handled by the proxy middleware.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const userId = data?.claims.sub;
  if (!userId) redirect("/login");
  return userId;
}
