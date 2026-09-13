import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Same minimal config as apps/website — no extra Cloudflare bindings needed. Staff
// sessions are Supabase Auth cookies; there's no Cloudflare-native storage dependency.
export default defineCloudflareConfig();
