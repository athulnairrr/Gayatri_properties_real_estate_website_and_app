import { WishlistClient } from "./WishlistClient";

export const metadata = { title: "My Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-page py-10">
      <h1 className="font-serif text-3xl font-semibold text-brand-950">My Wishlist</h1>
      <p className="mt-1 text-sm text-brand-500">
        Properties you&apos;ve saved while browsing. Nothing is shared until you send it below.
      </p>
      <div className="mt-8">
        <WishlistClient />
      </div>
    </div>
  );
}
