"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWishlist, onWishlistChange } from "@/lib/wishlist";

export function WishlistNavLink({ mobile = false }: { mobile?: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(getWishlist().length);
    return onWishlistChange(() => setCount(getWishlist().length));
  }, []);

  return (
    <Link
      href="/wishlist"
      prefetch={false}
      className={
        mobile
          ? "rounded-lg px-3 py-3 text-base font-medium text-brand-800 hover:bg-brand-50"
          : "text-sm font-medium text-brand-700 transition hover:text-brand-950"
      }
    >
      Wishlist{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
