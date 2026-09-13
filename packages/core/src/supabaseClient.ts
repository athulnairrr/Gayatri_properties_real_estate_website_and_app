// The ONLY place Supabase client construction happens. UI code never calls
// `createClient` directly — it gets a client from here and passes it into a
// service function from packages/core/src/services/*.
//
// Three client kinds, each with a distinct trust boundary:
//   - browser client   (anon key)     -> safe to ship to any browser bundle
//   - server client    (anon key)     -> for SSR reads/writes as the signed-in user (cookies)
//   - service client   (service key)  -> SERVER-ONLY, bypasses RLS. Never import this file's
//                                        `createServiceClient` from any file that ends up in a
//                                        client bundle (Next.js "use client" components).
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";
import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

function requireEnv(url: string | undefined, anonKey: string | undefined): SupabaseEnv {
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill them in."
    );
  }
  return { url, anonKey };
}

/** Minimal cookie adapter shape both Next.js server contexts (route handlers, server actions,
 * server components) can satisfy without this package depending on next/headers directly. */
export interface CookieAdapter {
  get(name: string): { value: string } | undefined;
  set(name: string, value: string, options: Record<string, unknown>): void;
}

export function createBrowserClient(env: SupabaseEnv): SupabaseClient {
  const { url, anonKey } = requireEnv(env.url, env.anonKey);
  return createSupabaseBrowserClient(url, anonKey);
}

export function createServerClient(env: SupabaseEnv, cookies: CookieAdapter): SupabaseClient {
  const { url, anonKey } = requireEnv(env.url, env.anonKey);
  return createSupabaseServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookies.get(name)?.value;
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        try {
          cookies.set(name, value, options);
        } catch {
          // Called from a Server Component render — session refresh cookies can't be
          // written there; middleware handles refresh instead. Safe to ignore.
        }
      },
      remove(name: string, options: Record<string, unknown>) {
        try {
          cookies.set(name, "", options);
        } catch {
          // see above
        }
      },
    },
  });
}

/**
 * SERVER-ONLY. Uses the service-role key and bypasses RLS entirely.
 * Only ever call this from server-side code (Route Handlers, Server Actions) that itself
 * enforces the access check — e.g. QR code generation, which needs to resolve a property
 * code without depending on the caller's own RLS visibility. NEVER call from a "use client"
 * component or anything bundled for the browser.
 */
export function createServiceClient(url: string, serviceRoleKey: string): SupabaseClient {
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for service client");
  }
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
