import { createBrowserClient as coreCreateBrowserClient } from "@realestate/core";
import { env } from "./env";

/** Browser client — anon key only. Safe to import from "use client" components (does not
 * pull in next/headers, unlike "@/lib/supabaseServer"). */
export function getBrowserSupabase() {
  return coreCreateBrowserClient({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
}
