"use client";

import { useLeadCapture } from "./LeadCaptureProvider";

export function ContactCta() {
  const { openLeadCapture } = useLeadCapture();

  return (
    <section className="bg-brand-900">
      <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
        <h2 className="font-serif text-3xl font-semibold text-white">
          Looking for the right property in Thane?
        </h2>
        <p className="max-w-xl text-brand-200">
          Tell us what you&apos;re looking for and our team will help you find suitable options —
          no account, no forms, just a quick call.
        </p>
        <button
          type="button"
          onClick={() => openLeadCapture({ headline: "Tell us what you're looking for" })}
          className="rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-900 transition hover:bg-brand-100"
        >
          Talk to Our Team
        </button>
      </div>
    </section>
  );
}
