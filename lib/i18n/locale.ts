import { cookies } from "next/headers";
import { dictionaries, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "ko";
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
