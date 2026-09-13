"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLeadCapture } from "./LeadCaptureProvider";
import { SESSION_PROMPTED_KEY } from "./LeadCaptureProvider";

/**
 * When a visitor arrives via a printed QR code (property board/flyer/brochure), the
 * property URL carries ?src=qr. Skip the usual 30s engagement wait and immediately offer
 * the quick "leave your name and phone" capture, tagged source=QR_CODE so staff can see
 * this enquiry came from a physical listing, not the general website.
 */
export function QrScanCapture({
  propertyId,
  propertyLabel,
}: {
  propertyId: string;
  propertyLabel: string;
}) {
  const searchParams = useSearchParams();
  const { openLeadCapture } = useLeadCapture();

  useEffect(() => {
    if (searchParams.get("src") !== "qr") return;
    try {
      if (window.sessionStorage.getItem(SESSION_PROMPTED_KEY) === "1") return;
      window.sessionStorage.setItem(SESSION_PROMPTED_KEY, "1");
    } catch {
      // ignore — worst case the 30s engagement timer also opens it later
    }
    openLeadCapture({
      propertyId,
      propertyLabel,
      source: "QR_CODE",
      headline: "Scanned our sign?",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
