"use server";

import { createPublicLead, isPlausiblePhone, toE164IndiaDefault } from "@realestate/core";
import { getServerSupabase } from "@/lib/supabase";

export interface SubmitLeadState {
  status: "idle" | "success" | "error";
  message?: string;
  customerCode?: string;
}

/**
 * The ONLY lead-creation path this app uses. Calls the approved create_public_lead()
 * function (via packages/core) — never inserts into customers/leads directly. No OTP,
 * no phone verification: phone is stored as unverified by design (see docs/ARCHITECTURE.md).
 */
export async function submitLeadAction(
  _prev: SubmitLeadState,
  formData: FormData
): Promise<SubmitLeadState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const propertyId = String(formData.get("propertyId") ?? "") || null;
  const landingPage = String(formData.get("landingPage") ?? "") || null;

  if (fullName.length < 2) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!isPlausiblePhone(phoneRaw)) {
    return { status: "error", message: "Please enter a valid phone number." };
  }

  const phone = toE164IndiaDefault(phoneRaw);

  try {
    const supabase = getServerSupabase();
    const result = await createPublicLead(supabase, {
      fullName,
      phone,
      propertyId,
      source: "WEBSITE",
      landingPage,
    });
    return {
      status: "success",
      message: "Thanks! Our team will reach out to you shortly.",
      customerCode: result.customer_code,
    };
  } catch (err) {
    console.error("submitLeadAction failed", err);
    return {
      status: "error",
      message: "Something went wrong sending your enquiry. Please try calling us instead.",
    };
  }
}
