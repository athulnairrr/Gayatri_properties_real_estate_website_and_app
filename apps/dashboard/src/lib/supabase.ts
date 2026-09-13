import { cookies } from "next/headers";
import {
  createBrowserClient as coreCreateBrowserClient,
  createServerClient as coreCreateServerClient,
} from "@realestate/core";
import { env } from "./env";

/** Anon-key browser client. Staff sessions are established via Supabase Auth (email/password
 * for MVP) — actual authorization is enforced by RLS + staff_profiles, never by this client
 * alone. */
export function getBrowserSupabase() {
  return coreCreateBrowserClient({ url: env.supabaseUrl, anonKey: env.supabaseAnonKey });
}

/** Server Component / Route Handler / Server Action client, reading the staff member's
 * session from cookies. */
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
