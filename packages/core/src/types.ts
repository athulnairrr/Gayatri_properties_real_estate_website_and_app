// Types mirror packages/db/migrations exactly. Keep in sync with the schema by hand for
// the MVP (a generated-types step can replace this later without changing callers).

export type TransactionType = "SALE" | "RENT";
export type PropertyType = "FLAT" | "PLOT" | "VILLA" | "COMMERCIAL";
export type PropertyStatus = "AVAILABLE" | "HOLD" | "SOLD" | "RENTED";
export type PersonRole = "BUYER" | "TENANT" | "OWNER" | "BROKER" | "BUILDER";
export type LeadStatus = "NEW_LEAD" | "CONTACTED" | "ACTIVE" | "INACTIVE";
export type LeadSource =
  | "WEBSITE"
  | "QR_CODE"
  | "WHATSAPP"
  | "PHONE"
  | "WALK_IN"
  | "REFERRAL"
  | "MANUAL";
export type VisitStatus = "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type FollowUpStatus = "PENDING" | "DONE" | "RESCHEDULED" | "CANCELLED";
export type DealStatus = "NEGOTIATION" | "TOKEN_RECEIVED" | "AGREEMENT_DONE" | "CLOSED";
export type StaffRole = "ADMIN" | "STAFF";

/** Row shape of the `public_properties` view — the ONLY property surface the public site may read. */
export interface PublicProperty {
  id: string;
  property_code: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  status: PropertyStatus;
  title: string;
  description: string | null;
  price: number;
  address: string | null;
  locality: string;
  city: string;
  state: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  area_sqft: number | null;
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: "IMAGE" | "VIDEO";
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
}

/** Row returned by properties_within_radius(). Intentionally narrower than PublicProperty. */
export interface PropertyRadiusResult {
  id: string;
  property_code: string;
  transaction_type: TransactionType;
  property_type: PropertyType;
  status: PropertyStatus;
  title: string;
  price: number;
  locality: string;
  city: string;
  latitude: number;
  longitude: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  distance_km: number;
}

/** Full internal property row (staff-only — includes owner/internal fields). */
export interface InternalProperty extends PublicProperty {
  negotiation_min: number | null;
  negotiation_max: number | null;
  owner_name: string | null;
  owner_phone: string | null;
  owner_email: string | null;
  internal_notes: string | null;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface Customer {
  id: string;
  customer_code: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  notes: string | null;
  lead_status: LeadStatus;
  phone_verified: boolean;
  phone_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRole {
  customer_id: string;
  role: PersonRole;
}

export interface Lead {
  id: string;
  customer_id: string;
  property_id: string | null;
  source: LeadSource;
  landing_page: string | null;
  message: string | null;
  created_at: string;
}

/** Convenience shape for the dashboard leads list: a lead interaction joined with its customer + property. */
export interface LeadWithContext extends Lead {
  customer: Pick<
    Customer,
    "id" | "customer_code" | "full_name" | "phone" | "whatsapp" | "lead_status" | "phone_verified"
  >;
  property: Pick<PublicProperty, "id" | "property_code" | "title" | "locality"> | null;
}

export interface Visit {
  id: string;
  customer_id: string;
  property_id: string;
  staff_id: string | null;
  scheduled_at: string;
  status: VisitStatus;
  notes: string | null;
}

export interface FollowUp {
  id: string;
  customer_id: string;
  next_follow_up: string;
  notes: string | null;
  assigned_to: string | null;
  status: FollowUpStatus;
}

export interface Deal {
  id: string;
  property_id: string;
  customer_id: string;
  deal_value: number;
  expected_commission: number;
  commission_received: number;
  status: DealStatus;
  notes: string | null;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: StaffRole;
  phone: string | null;
  is_active: boolean;
}

export interface CreatePublicLeadResult {
  lead_id: string;
  customer_code: string;
}

/** Standard pagination shape used by all list-returning service functions. */
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
