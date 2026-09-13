import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal, no-frills config for the MVP: static incremental cache handled by the default
// Workers Cache API adapter (no KV/D1/R2 needed), no extra Cloudflare bindings required —
// this app only calls out to Supabase, it doesn't need any Cloudflare-native storage.
export default defineCloudflareConfig();
