// Internal/staff-facing service functions. Every one of these relies on RLS: the client
// passed in must be an authenticated Supabase client for a signed-in staff_profiles user,
// or these calls simply return nothing / are rejected by Postgres. Never bypass that by
// switching to the service-role client just to make a screen "work".
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Customer,
  Deal,
  FollowUp,
  FollowUpStatus,
  InternalProperty,
  Lead,
  LeadStatus,
  LeadWithContext,
  Page,
  PropertyStatus,
  PropertyType,
  StaffProfile,
  TransactionType,
  Visit,
  VisitStatus,
} from "../types";

const DEFAULT_PAGE_SIZE = 20;

function paged(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const p = Math.max(page, 1);
  const size = Math.min(Math.max(pageSize, 1), 100);
  const from = (p - 1) * size;
  return { from, to: from + size - 1, page: p, pageSize: size };
}

export async function getCurrentStaffProfile(
  client: SupabaseClient
): Promise<StaffProfile | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data, error } = await client
    .from("staff_profiles")
    .select("id, user_id, full_name, role, phone, is_active")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return (data as StaffProfile) ?? null;
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------
export interface LeadFilters {
  status?: LeadStatus;
  page?: number;
  pageSize?: number;
}

/** Recent lead interactions with customer + property context joined in, newest first. */
export async function getInternalLeads(
  client: SupabaseClient,
  filters: LeadFilters = {}
): Promise<Page<LeadWithContext>> {
  const { from, to, page, pageSize } = paged(filters.page, filters.pageSize);

  let query = client
    .from("leads")
    .select(
      `id, customer_id, property_id, source, landing_page, message, created_at,
       customer:customers!inner ( id, customer_code, full_name, phone, whatsapp, lead_status, phone_verified ),
       property:properties ( id, property_code, title, locality )`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("customer.lead_status", filters.status);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as unknown as LeadWithContext[], total: count ?? 0, page, pageSize };
}

export async function updateCustomerLeadStatus(
  client: SupabaseClient,
  customerId: string,
  status: LeadStatus
): Promise<void> {
  const { error } = await client.from("customers").update({ lead_status: status }).eq("id", customerId);
  if (error) throw error;
}

export async function appendCustomerNote(
  client: SupabaseClient,
  customerId: string,
  note: string
): Promise<void> {
  const { data: existing, error: fetchErr } = await client
    .from("customers")
    .select("notes")
    .eq("id", customerId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
  const combined = existing?.notes ? `${existing.notes}\n[${stamp}] ${note}` : `[${stamp}] ${note}`;

  const { error } = await client.from("customers").update({ notes: combined }).eq("id", customerId);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export interface CustomerFilters {
  search?: string; // matches name, phone, customer_code
  page?: number;
  pageSize?: number;
}

export async function getInternalCustomers(
  client: SupabaseClient,
  filters: CustomerFilters = {}
): Promise<Page<Customer>> {
  const { from, to, page, pageSize } = paged(filters.page, filters.pageSize);
  let query = client
    .from("customers")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(
        `full_name.ilike.%${term}%,phone.ilike.%${term}%,customer_code.ilike.%${term}%`
      );
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as Customer[], total: count ?? 0, page, pageSize };
}

export async function getCustomerById(
  client: SupabaseClient,
  id: string
): Promise<Customer | null> {
  const { data, error } = await client.from("customers").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Customer) ?? null;
}

// ---------------------------------------------------------------------------
// Properties (internal — full row, including owner/internal fields)
// ---------------------------------------------------------------------------
export interface InternalPropertyFilters {
  search?: string;
  status?: PropertyStatus;
  transactionType?: TransactionType;
  propertyType?: PropertyType;
  page?: number;
  pageSize?: number;
}

export async function getInternalProperties(
  client: SupabaseClient,
  filters: InternalPropertyFilters = {}
): Promise<Page<InternalProperty>> {
  const { from, to, page, pageSize } = paged(filters.page, filters.pageSize);
  let query = client
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.transactionType) query = query.eq("transaction_type", filters.transactionType);
  if (filters.propertyType) query = query.eq("property_type", filters.propertyType);
  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(
        `title.ilike.%${term}%,property_code.ilike.%${term}%,locality.ilike.%${term}%`
      );
    }
  }

  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { items: (data ?? []) as InternalProperty[], total: count ?? 0, page, pageSize };
}

export async function getInternalPropertyById(
  client: SupabaseClient,
  id: string
): Promise<InternalProperty | null> {
  const { data, error } = await client.from("properties").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as InternalProperty) ?? null;
}

export type NewPropertyInput = Omit<
  InternalProperty,
  "id" | "property_code" | "created_at" | "updated_at" | "created_by" | "updated_by"
>;

export async function createProperty(
  client: SupabaseClient,
  input: Partial<NewPropertyInput>
): Promise<InternalProperty> {
  const { data, error } = await client.from("properties").insert(input).select("*").single();
  if (error) throw error;
  return data as InternalProperty;
}

export async function updateProperty(
  client: SupabaseClient,
  id: string,
  patch: Partial<NewPropertyInput>
): Promise<InternalProperty> {
  const { data, error } = await client
    .from("properties")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as InternalProperty;
}

/** Archiving is the intended lifecycle mechanism (status change), not row deletion —
 * consistent with the FK RESTRICT behavior on visits/follow-ups (see AUDIT_2026-09-13.md). */
export async function archiveProperty(client: SupabaseClient, id: string, status: PropertyStatus) {
  return updateProperty(client, id, { status });
}

// ---------------------------------------------------------------------------
// Visits
// ---------------------------------------------------------------------------
export interface VisitFilters {
  from?: string; // ISO date, inclusive
  to?: string; // ISO date, exclusive
  status?: VisitStatus;
}

export async function getVisits(client: SupabaseClient, filters: VisitFilters = {}) {
  let query = client
    .from("visits")
    .select(
      `id, customer_id, property_id, staff_id, scheduled_at, status, notes,
       customer:customers ( id, full_name, phone ),
       property:properties ( id, property_code, title, locality )`
    )
    .order("scheduled_at", { ascending: true });

  if (filters.from) query = query.gte("scheduled_at", filters.from);
  if (filters.to) query = query.lt("scheduled_at", filters.to);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface NewVisitInput {
  customerId: string;
  propertyId: string;
  staffId?: string | null;
  scheduledAt: string;
  notes?: string | null;
}

export async function createVisit(client: SupabaseClient, input: NewVisitInput): Promise<Visit> {
  const { data, error } = await client
    .from("visits")
    .insert({
      customer_id: input.customerId,
      property_id: input.propertyId,
      staff_id: input.staffId ?? null,
      scheduled_at: input.scheduledAt,
      notes: input.notes ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function updateVisitStatus(client: SupabaseClient, id: string, status: VisitStatus) {
  const { error } = await client.from("visits").update({ status }).eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------
export interface FollowUpFilters {
  status?: FollowUpStatus;
  dueBefore?: string; // ISO — "overdue"/"due today" queries
  dueAfter?: string;
}

export async function getFollowUps(client: SupabaseClient, filters: FollowUpFilters = {}) {
  let query = client
    .from("follow_ups")
    .select(
      `id, customer_id, next_follow_up, notes, assigned_to, status,
       customer:customers ( id, full_name, phone )`
    )
    .order("next_follow_up", { ascending: true });

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.dueBefore) query = query.lte("next_follow_up", filters.dueBefore);
  if (filters.dueAfter) query = query.gte("next_follow_up", filters.dueAfter);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export interface NewFollowUpInput {
  customerId: string;
  nextFollowUp: string;
  notes?: string | null;
  assignedTo?: string | null;
}

export async function createFollowUp(
  client: SupabaseClient,
  input: NewFollowUpInput
): Promise<FollowUp> {
  const { data, error } = await client
    .from("follow_ups")
    .insert({
      customer_id: input.customerId,
      next_follow_up: input.nextFollowUp,
      notes: input.notes ?? null,
      assigned_to: input.assignedTo ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as FollowUp;
}

export async function updateFollowUpStatus(
  client: SupabaseClient,
  id: string,
  status: FollowUpStatus
) {
  const { error } = await client.from("follow_ups").update({ status }).eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------
export async function getDeals(client: SupabaseClient) {
  const { data, error } = await client
    .from("deals")
    .select(
      `id, property_id, customer_id, deal_value, expected_commission, commission_received, status, notes,
       customer:customers ( id, full_name, phone ),
       property:properties ( id, property_code, title )`
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Dashboard summary counts — small, targeted counts, never a `select *` over a whole table.
// ---------------------------------------------------------------------------
export async function getDashboardCounts(client: SupabaseClient) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const [newLeads, availableProps, todaysVisits, upcomingVisits, followUpsDue, activeDeals, pendingCommission] =
    await Promise.all([
      client.from("customers").select("id", { count: "exact", head: true }).eq("lead_status", "NEW_LEAD"),
      client.from("properties").select("id", { count: "exact", head: true }).eq("status", "AVAILABLE"),
      client
        .from("visits")
        .select("id", { count: "exact", head: true })
        .gte("scheduled_at", todayStart.toISOString())
        .lt("scheduled_at", todayEnd.toISOString()),
      client
        .from("visits")
        .select("id", { count: "exact", head: true })
        .gte("scheduled_at", todayEnd.toISOString())
        .in("status", ["SCHEDULED", "CONFIRMED"]),
      client
        .from("follow_ups")
        .select("id", { count: "exact", head: true })
        .lte("next_follow_up", todayEnd.toISOString())
        .eq("status", "PENDING"),
      client
        .from("deals")
        .select("id", { count: "exact", head: true })
        .in("status", ["NEGOTIATION", "TOKEN_RECEIVED", "AGREEMENT_DONE"]),
      client.from("deals").select("expected_commission, commission_received"),
    ]);

  const pending = (pendingCommission.data ?? []).reduce(
    (sum, d: { expected_commission: number; commission_received: number }) =>
      sum + (Number(d.expected_commission) - Number(d.commission_received)),
    0
  );

  return {
    newLeads: newLeads.count ?? 0,
    availableProperties: availableProps.count ?? 0,
    todaysVisits: todaysVisits.count ?? 0,
    upcomingVisits: upcomingVisits.count ?? 0,
    followUpsDue: followUpsDue.count ?? 0,
    activeDeals: activeDeals.count ?? 0,
    pendingCommission: pending,
  };
}
