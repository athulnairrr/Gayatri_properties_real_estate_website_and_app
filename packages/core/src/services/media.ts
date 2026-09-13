import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Cover image lookup for a batch of properties, used to render list/card thumbnails
 * without an extra round-trip per card. Returns only what's needed: property_id -> url.
 */
export async function getCoverImagesByPropertyId(
  client: SupabaseClient,
  propertyIds: string[]
): Promise<Record<string, string>> {
  if (propertyIds.length === 0) return {};
  const { data, error } = await client
    .from("property_media")
    .select("property_id, storage_path")
    .eq("is_cover", true)
    .in("property_id", propertyIds);
  if (error) throw error;

  const map: Record<string, string> = {};
  for (const row of data ?? []) {
    map[row.property_id as string] = row.storage_path as string;
  }
  return map;
}

/**
 * All photo URLs per property (in display order), used for the auto-rotating card
 * gallery. Same batching principle as getCoverImagesByPropertyId — one query for the
 * whole list, never one query per card.
 */
export async function getAllImagesByPropertyId(
  client: SupabaseClient,
  propertyIds: string[]
): Promise<Record<string, string[]>> {
  if (propertyIds.length === 0) return {};
  const { data, error } = await client
    .from("property_media")
    .select("property_id, storage_path, sort_order")
    .eq("media_type", "IMAGE")
    .in("property_id", propertyIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;

  const map: Record<string, string[]> = {};
  for (const row of data ?? []) {
    const id = row.property_id as string;
    (map[id] ??= []).push(row.storage_path as string);
  }
  return map;
}
