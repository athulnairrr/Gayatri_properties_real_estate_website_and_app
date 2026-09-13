"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { submitLeadAction, type SubmitLeadState } from "@/app/actions/lead";

const initialState: SubmitLeadState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send Enquiry"}
    </button>
  );
}

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  propertyId?: string | null;
  propertyLabel?: string | null;
  headline?: string;
  source?: "WEBSITE" | "QR_CODE";
}

export function LeadCaptureModal({
  open,
  onClose,
  propertyId,
  propertyLabel,
  headline,
  source = "WEBSITE",
}: LeadCaptureModalProps) {
  const [state, formAction] = useFormState(submitLeadAction, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      try {
        window.localStorage.setItem("tr_lead_submitted", "1");
      } catch {
        // localStorage unavailable (private mode etc.) — not critical
      }
    }
  }, [state.status]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-brand-950/40 backdrop-blur-sm sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-card sm:rounded-3xl sm:p-8"
      >
        {state.status === "success" ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-2xl">
              ✓
            </div>
            <h3 className="font-serif text-xl font-semibold text-brand-950">Enquiry sent</h3>
            <p className="mt-2 text-sm text-brand-600">{state.message}</p>
            <button type="button" onClick={onClose} className="btn-secondary mt-6">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-brand-950">
                  {headline ?? "Interested in finding the right property?"}
                </h3>
                <p className="mt-1 text-sm text-brand-600">
                  {propertyLabel
                    ? `Share your details and our team will help you with ${propertyLabel}.`
                    : "Let our team help you find suitable options in Thane and nearby areas."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="shrink-0 text-2xl leading-none text-brand-400 hover:text-brand-700"
              >
                ×
              </button>
            </div>

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="propertyId" value={propertyId ?? ""} />
              <input type="hidden" name="source" value={source} />
              <input
                type="hidden"
                name="landingPage"
                value={typeof window !== "undefined" ? window.location.pathname : ""}
              />
              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-brand-800">
                  Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="Your full name"
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-medium text-brand-800">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  className="input-field"
                />
              </div>

              {state.status === "error" && (
                <p className="text-sm text-red-600" role="alert">
                  {state.message}
                </p>
              )}

              <SubmitButton />
              <p className="text-center text-xs text-brand-400">
                No account, no OTP — just leave your number and we&apos;ll call you back.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
