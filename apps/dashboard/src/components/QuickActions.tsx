"use client";

import { telHref, whatsappHref } from "@realestate/core";

export function CallButton({ phone }: { phone: string }) {
  return (
    <a href={telHref(phone)} className="btn-secondary px-3 py-1.5 text-xs">
      Call
    </a>
  );
}

export function WhatsAppButton({ phone, message }: { phone: string; message?: string }) {
  return (
    <a
      href={whatsappHref(phone, message)}
      target="_blank"
      rel="noreferrer"
      className="btn-secondary px-3 py-1.5 text-xs"
    >
      WhatsApp
    </a>
  );
}
