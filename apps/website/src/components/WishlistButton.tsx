"use client";

import { useEffect, useState } from "react";
import { isInWishlist, onWishlistChange, toggleWishlist } from "@/lib/wishlist";

export function WishlistButton({
  propertyCode,
  variant = "icon",
}: {
  propertyCode: string;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(propertyCode));
    return onWishlistChange(() => setSaved(isInWishlist(propertyCode)));
  }, [propertyCode]);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved(toggleWishlist(propertyCode));
  }

  if (variant === "full") {
    return (
      <button type="button" onClick={handleClick} className="btn-secondary w-full">
        {saved ? "♥ Saved to Wishlist" : "♡ Save to Wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-base shadow-sm transition ${
        saved ? "bg-red-500 text-white" : "bg-white/90 text-brand-700 hover:bg-white"
      }`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
