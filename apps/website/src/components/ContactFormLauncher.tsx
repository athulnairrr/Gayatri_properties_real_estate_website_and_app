"use client";

import { useLeadCapture } from "./LeadCaptureProvider";

export function ContactFormLauncher() {
  const { openLeadCapture } = useLeadCapture();
  return (
    <button
      type="button"
      onClick={() => openLeadCapture({ headline: "Send us your details" })}
      className="btn-primary"
    >
      Send Us Your Details
    </button>
  );
}
