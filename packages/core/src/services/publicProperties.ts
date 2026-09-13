import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  CreatePublicLeadResult,
  Page,
  PropertyMedia,
  PropertyRadiusResult,
  PropertyType,
  PublicProperty,
  TransactionType,
} from "../types";

const DEFAULT_PAGE_SIZE = 12;

export interface PropertySearchFilters {
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  locality?: string; // matched against locality/city/title, case-insensitive
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  page?: number;
  pageSize?: number;
}

/**
 * Server-side filtered + paginated property search against `public_properties`.
 * Never fetches the whole table — Postgres does the filtering/sorting/paging.
 */
export async function searchProperties(
  client: SupabaseClient,
  filters: PropertySearchFilters = {}
): Promise<Page<PublicProperty>> {
  const page = Math.max(filters.page ?? 1, 1);
  const pageSize = Math.min(Math.max(filters.pageSize ?? DEFAULT_PAGE_SIZE, 1), 48);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client.from("public_properties").select("*", { count: "exact" });

  if (filters.transactionType) query = query.eq("transaction_type", filters.transactionType);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.minPrice != null) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice != null) query = query.lte("price", filters.maxPrice);
  if (filters.bedrooms != null) query = query.gte("bedrooms", filters.bedrooms);
  if (filters.locality) {
    const term = filters.locality.trim();
    if (term) {
      query = query.or(
        `locality.ilike.%${term}%,city.ilike.%${term}%,title.ilike.%${term}%`
      );
    }
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;

  return { items: (data ?? []) as PublicProperty[], total: count ?? 0, page, pageSize };
}

export async function getFeaturedProperties(
  client: SupabaseClient,
  limit = 6
): Promise<PublicProperty[]> {
  const { data, error } = await client
    .from("public_properties")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PublicProperty[];
}

/** Batch lookup for the wishlist page — fetches only the specific properties a visitor
 * saved (by code), never the whole table. */
export async function getPublicPropertiesByCodes(
  client: SupabaseClient,
  propertyCodes: string[]
): Promise<PublicProperty[]> {
  if (propertyCodes.length === 0) return [];
  const { data, error } = await client
    .from("public_properties")
    .select("*")
    .in("property_code", propertyCodes);
  if (error) throw error;
  return (data ?? []) as PublicProperty[];
}

export async function getPublicPropertyByCode(
  client: SupabaseClient,
  propertyCode: string
): Promise<PublicProperty | null> {
  const { data, error } = await client
    .from("public_properties")
    .select("*")
    .eq("property_code", propertyCode)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicProperty) ?? null;
}

export async function getPropertyMedia(
  client: SupabaseClient,
  propertyId: string
): Promise<PropertyMedia[]> {
  const { data, error } = await client
    .from("property_media")
    .select("id, property_id, media_type, storage_path, is_cover, sort_order")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PropertyMedia[];
}

export interface RadiusSearchInput {
  lng: number;
  lat: number;
  radiusKm: number;
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  limit?: number;
  offset?: number;
}

/** Delegates entirely to the DB-side properties_within_radius() function — never
 * computes distance in JS, never downloads the full table. */
export async function getPropertiesWithinRadius(
  client: SupabaseClient,
  input: RadiusSearchInput
): Promise<PropertyRadiusResult[]> {
  const { data, error } = await client.rpc("properties_within_radius", {
    p_lng: input.lng,
    p_lat: input.lat,
    p_radius_km: input.radiusKm,
    p_transaction_type: input.transactionType ?? null,
    p_property_type: input.propertyType ?? null,
    p_min_price: input.minPrice ?? null,
    p_max_price: input.maxPrice ?? null,
    p_bedrooms: input.bedrooms ?? null,
    p_limit: input.limit ?? 20,
    p_offset: input.offset ?? 0,
  });
  if (error) throw error;
  return (data ?? []) as PropertyRadiusResult[];
}

export interface CreatePublicLeadInput {
  fullName: string;
  phone: string;
  propertyId?: string | null;
  source?: "WEBSITE" | "QR_CODE";
  landingPage?: string | null;
  message?: string | null;
}

/**
 * The ONLY lead-creation path the public site may use. Delegates to the approved
 * create_public_lead() SQL function (SECURITY DEFINER) — never inserts into
 * customers/leads directly from client code.
 */
export async function createPublicLead(
  client: SupabaseClient,
  input: CreatePublicLeadInput
): Promise<CreatePublicLeadResult> {
  const { data, error } = await client.rpc("create_public_lead", {
    p_full_name: input.fullName,
    p_phone: input.phone,
    p_property_id: input.propertyId ?? null,
    p_source: input.source ?? "WEBSITE",
    p_landing_page: input.landingPage ?? null,
    p_message: input.message ?? null,
  });
  if (error) throw error;
  // create_public_lead returns `setof record` -> supabase-js gives an array of rows.
  const row = Array.isArray(data) ? data[0] : data;
  return row as CreatePublicLeadResult;
}
