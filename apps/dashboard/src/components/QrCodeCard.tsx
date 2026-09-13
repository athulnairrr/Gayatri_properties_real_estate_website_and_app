"use client";

import { useEffect, useState } from "react";
import { generateQrDataUrl } from "@realestate/core";

export function QrCodeCard({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  // src=qr tags this specific print/board code so a scan skips straight to the quick
  // phone-capture on the public site and is recorded with source=QR_CODE.
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
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR code linking to this property" className="h-full w-full" />
        ) : (
          <span className="text-xs text-ink-400">Generating…</span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink-900">Generate QR</p>
        <p className="mt-1 break-all text-xs text-ink-500">{url}</p>
        <p className="mt-1 text-xs text-ink-400">
          A scan lands here and is immediately asked for name + phone — recorded as a QR Code lead.
        </p>
      </div>
    </div>
  );
}
