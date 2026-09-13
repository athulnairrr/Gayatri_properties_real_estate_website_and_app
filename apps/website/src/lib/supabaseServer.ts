import { cookies } from "next/headers";
import { createServerClient as coreCreateServerClient } from "@realestate/core";
import { env } from "./env";

/** Server Component / Route Handler / Server Action client, reading the visitor's cookies.
 * Server-only: importing this file from a "use client" component breaks the build
 * (next/headers can't be bundled for the browser) — client code must import
 * getBrowserSupabase from "@/lib/supabaseBrowser" instead. */
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
