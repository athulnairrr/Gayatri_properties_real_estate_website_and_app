export function formatPriceINR(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
