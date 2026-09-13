"use client";

import { useEffect, useState } from "react";
import { generateQrDataUrl } from "@realestate/core";

export function QrCodeCard({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  // The QR still points at the same stable property URL (spec: never encode data into
  // it) — src=qr is just a tag so the page knows to skip straight to the quick phone
  // capture instead of waiting 30s, and so the resulting lead is recorded as QR_CODE.
  const qrTargetUrl = `${url}${url.includes("?") ? "&" : "?"}src=qr`;

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(qrTargetUrl, 240).then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [qrTargetUrl]);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR code linking to this property" className="h-full w-full" />
        ) : (
          <span className="text-xs text-brand-400">Generating…</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-900">Print this QR for boards &amp; flyers</p>
        <p className="mt-1 text-xs text-brand-500">
          A visitor who scans it lands on this listing and is immediately asked for just their
          name and phone number — no browsing required. That enquiry appears in your dashboard
          tagged &ldquo;QR Code&rdquo; with this property already attached.
        </p>
      </div>
    </div>
  );
}
