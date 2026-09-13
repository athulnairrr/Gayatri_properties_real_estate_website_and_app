import { cookies } from "next/headers";
import {
  createBrowserClient as coreCreateBrowserClient,
  createServerClient as coreCreateServerClient,
} from "@realestate/core";
import { env } from "./env";

/** Browser client — anon key only, safe for any client component. */
export function getBrowserSupabase() {
  return coreCreateBrowserClient({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
}

/** Server Component / Route Handler client — anon key, reads the visitor's cookies. The
 * public website never needs an authenticated session, but using the same client shape
 * keeps this file identical in spirit to the dashboard app for consistency. */
export function getServerSupabase() {
  const cookieStore = cookies();
  return coreCreateServerClient(
    { url: env.supabaseUrl, anonKey: env.supabaseAnonKey },
    {
      get: (name: string) => cookieStore.get(name),
      set: (name: string, value: string, options: Record<string, unknown>) =>
        cookieStore.set({ name, value, ...options }),
    }
  );
}
