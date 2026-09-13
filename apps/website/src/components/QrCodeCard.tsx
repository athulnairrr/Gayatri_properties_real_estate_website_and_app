"use client";

import { useEffect, useState } from "react";
import { generateQrDataUrl } from "@realestate/core";

export function QrCodeCard({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(url, 240).then((d) => {
      if (!cancelled) setDataUrl(d);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

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
        <p className="text-sm font-semibold text-brand-900">Scan to share this listing</p>
        <p className="mt-1 text-xs text-brand-500">
          Use this on flyers, boards or brochures — it always points to this property&apos;s page,
          even if the details change later.
        </p>
      </div>
    </div>
  );
}
