"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  archiveProperty,
  createProperty,
  updateProperty,
  type PropertyStatus,
  type PropertyType,
  type TransactionType,
} from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";

function readPropertyForm(formData: FormData) {
  return {
    transaction_type: String(formData.get("transaction_type")) as TransactionType,
    property_type: String(formData.get("property_type")) as PropertyType,
    status: (String(formData.get("status")) || "AVAILABLE") as PropertyStatus,
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    price: Number(formData.get("price")),
    negotiation_min: formData.get("negotiation_min") ? Number(formData.get("negotiation_min")) : null,
    negotiation_max: formData.get("negotiation_max") ? Number(formData.get("negotiation_max")) : null,
    address: String(formData.get("address") ?? "").trim() || null,
    locality: String(formData.get("locality") ?? "").trim(),
    city: String(formData.get("city") ?? "Thane").trim(),
    state: String(formData.get("state") ?? "Maharashtra").trim(),
    postal_code: String(formData.get("postal_code") ?? "").trim() || null,
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    bedrooms: formData.get("bedrooms") ? Number(formData.get("bedrooms")) : null,
    bathrooms: formData.get("bathrooms") ? Number(formData.get("bathrooms")) : null,
    parking: formData.get("parking") ? Number(formData.get("parking")) : null,
    area_sqft: formData.get("area_sqft") ? Number(formData.get("area_sqft")) : null,
    owner_name: String(formData.get("owner_name") ?? "").trim() || null,
    owner_phone: String(formData.get("owner_phone") ?? "").trim() || null,
    owner_email: String(formData.get("owner_email") ?? "").trim() || null,
    internal_notes: String(formData.get("internal_notes") ?? "").trim() || null,
  };
}

export async function createPropertyAction(formData: FormData) {
  const supabase = getServerSupabase();
  const input = readPropertyForm(formData);
  const created = await createProperty(supabase, input);
  revalidatePath("/properties");
  redirect(`/properties/${created.id}`);
}

export async function updatePropertyAction(formData: FormData) {
  const id = String(formData.get("id"));
  const supabase = getServerSupabase();
  const input = readPropertyForm(formData);
  await updateProperty(supabase, id, input);
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
}

export async function archivePropertyAction(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as PropertyStatus;
  const supabase = getServerSupabase();
  await archiveProperty(supabase, id, status);
  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
}
