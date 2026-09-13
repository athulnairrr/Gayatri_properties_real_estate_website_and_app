export function formatPriceINR(value: number): string {
  if (value >= 10_000_000) return `₹${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 2)} Cr`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function transactionLabel(t: "SALE" | "RENT"): string {
  return t === "SALE" ? "For Sale" : "For Rent";
}

export function propertyTypeLabel(t: string): string {
  const map: Record<string, string> = {
    FLAT: "Apartment",
    PLOT: "Plot",
    VILLA: "Villa",
    COMMERCIAL: "Commercial",
  };
  return map[t] ?? t;
}
