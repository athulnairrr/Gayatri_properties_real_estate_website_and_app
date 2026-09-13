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
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() =>
          openLeadCapture({
            propertyId,
            propertyLabel,
            headline: "Interested in this property?",
          })
        }
        className="btn-primary w-full"
      >
        Contact About This Property
      </button>
      <div className="grid grid-cols-2 gap-3">
        <a href={telHref(FIRM_PHONE)} className="btn-secondary">
          Call
        </a>
        <a
          href={whatsappHref(FIRM_WHATSAPP, `Hi, I'm interested in ${propertyLabel}.`)}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
