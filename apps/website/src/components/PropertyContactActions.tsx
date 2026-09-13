"use client";

import { telHref, whatsappHref } from "@realestate/core";
import { FIRM_PHONE, FIRM_WHATSAPP } from "@/lib/constants";
import { useLeadCapture } from "./LeadCaptureProvider";

export function PropertyContactActions({
  propertyId,
  propertyLabel,
}: {
  propertyId: string;
  propertyLabel: string;
}) {
  const { openLeadCapture } = useLeadCapture();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() =>
          openLeadCapture({
            propertyId,
            propertyLabel,
            headline: "Interested in this property?",
          })
        }
        className="btn-primary flex-1"
      >
        Contact About This Property
      </button>
      <a href={telHref(FIRM_PHONE)} className="btn-secondary flex-1">
        Call
      </a>
      <a
        href={whatsappHref(FIRM_WHATSAPP, `Hi, I'm interested in ${propertyLabel}.`)}
        target="_blank"
        rel="noreferrer"
        className="btn-secondary flex-1"
      >
        WhatsApp
      </a>
    </div>
  );
}
