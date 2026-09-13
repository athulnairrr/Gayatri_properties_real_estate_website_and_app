"use server";

import { createPublicLead, isPlausiblePhone, toE164IndiaDefault } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabaseServer";

export interface SubmitWishlistState {
  status: "idle" | "success" | "error";
  message?: string;
}

/**
 * A visitor's wishlist is browser-local until this point. Submitting it creates one lead
 * interaction per saved property — same create_public_lead() path as any other enquiry,
 * called once per property so each one carries its own property context (spec: property
 * context must not be lost). create_public_lead's phone-dedup means this always resolves
 * to a single customer record no matter how many properties are in the list.
 */
export async function submitWishlistLeadAction(
  _prev: SubmitWishlistState,
  formData: FormData
): Promise<SubmitWishlistState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const propertyIdsRaw = String(formData.get("propertyIds") ?? "");
  const propertyIds = propertyIdsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  if (fullName.length < 2) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!isPlausiblePhone(phoneRaw)) {
    return { status: "error", message: "Please enter a valid phone number." };
  }
  if (propertyIds.length === 0) {
    return { status: "error", message: "Your wishlist is empty." };
  }

  const phone = toE164IndiaDefault(phoneRaw);

  try {
    const supabase = getServerSupabase();
    for (const propertyId of propertyIds) {
      await createPublicLead(supabase, {
        fullName,
        phone,
        propertyId,
        source: "WEBSITE",
        message: "Submitted via wishlist",
      });
    }
    return {
      status: "success",
      message: `Thanks! Our team will reach out about all ${propertyIds.length} propert${propertyIds.length === 1 ? "y" : "ies"} you saved.`,
    };
  } catch (err) {
    console.error("submitWishlistLeadAction failed", err);
    return {
      status: "error",
      message: "Something went wrong sending your wishlist. Please try calling us instead.",
    };
  }
}
