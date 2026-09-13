// QR codes must point to a stable public property URL only — never encode property
// data itself, so listing info can change without invalidating printed QR codes (spec §10).
import QRCode from "qrcode";

export function publicPropertyUrl(siteUrl: string, propertyCode: string): string {
  return `${siteUrl.replace(/\/$/, "")}/property/${propertyCode}`;
}

/** Renders a QR code locally (no third-party API call, works offline) as a data: URL PNG.
 * Usable from both the website (share/print) and the dashboard ("Generate QR" per property). */
export async function generateQrDataUrl(targetUrl: string, size = 320): Promise<string> {
  return QRCode.toDataURL(targetUrl, { width: size, margin: 1 });
}
