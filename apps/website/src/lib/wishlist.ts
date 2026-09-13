"use client";

// A visitor's wishlist is purely a browser-local convenience (no login, no server round
// trip) — a list of property codes in localStorage. It only becomes server data at the
// point the visitor chooses to share it (submitting name + phone on /wishlist), which
// goes through the same approved create_public_lead() path as any other enquiry.
const STORAGE_KEY = "gp_wishlist";
const CHANGE_EVENT = "gp_wishlist_change";

function readRaw(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function writeRaw(codes: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    // localStorage unavailable (private mode, storage full, etc.) — wishlist just won't persist
  }
}

export function getWishlist(): string[] {
  return readRaw();
}

export function isInWishlist(propertyCode: string): boolean {
  return readRaw().includes(propertyCode);
}

export function toggleWishlist(propertyCode: string): boolean {
  const current = readRaw();
  const exists = current.includes(propertyCode);
  const next = exists ? current.filter((c) => c !== propertyCode) : [...current, propertyCode];
  writeRaw(next);
  return !exists;
}

export function removeFromWishlist(propertyCode: string) {
  writeRaw(readRaw().filter((c) => c !== propertyCode));
}

export function clearWishlist() {
  writeRaw([]);
}

export function onWishlistChange(handler: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler); // sync across tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
