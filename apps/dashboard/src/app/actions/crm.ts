"use server";

import { revalidatePath } from "next/cache";
import {
  appendCustomerNote,
  createFollowUp,
  createVisit,
  updateCustomerLeadStatus,
  updateFollowUpStatus,
  type FollowUpStatus,
  type LeadStatus,
} from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";

// Every one of these runs as the signed-in staff member's own Supabase session — RLS still
// decides whether the write actually lands (see docs/AUDIT_2026-09-13.md). No service-role
// client is used here.

export async function addNoteAction(formData: FormData) {
  const customerId = String(formData.get("customerId"));
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  const supabase = getServerSupabase();
  await appendCustomerNote(supabase, customerId, note);
  revalidatePath(`/leads/${customerId}`);
}

export async function setLeadStatusAction(formData: FormData) {
  const customerId = String(formData.get("customerId"));
  const status = String(formData.get("status")) as LeadStatus;
  const supabase = getServerSupabase();
  await updateCustomerLeadStatus(supabase, customerId, status);
  revalidatePath(`/leads/${customerId}`);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function createFollowUpAction(formData: FormData) {
  const customerId = String(formData.get("customerId"));
  const nextFollowUp = String(formData.get("nextFollowUp"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const supabase = getServerSupabase();
  await createFollowUp(supabase, { customerId, nextFollowUp, notes });
  revalidatePath(`/leads/${customerId}`);
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
}

export async function updateFollowUpStatusAction(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as FollowUpStatus;
  const supabase = getServerSupabase();
  await updateFollowUpStatus(supabase, id, status);
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
}

export async function scheduleVisitAction(formData: FormData) {
  const customerId = String(formData.get("customerId"));
  const propertyId = String(formData.get("propertyId"));
  const scheduledAt = String(formData.get("scheduledAt"));
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const supabase = getServerSupabase();
  await createVisit(supabase, { customerId, propertyId, scheduledAt, notes });
  revalidatePath(`/leads/${customerId}`);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
