import type { Metadata } from "next";
import { WishlistView } from "@/components/product/WishlistView";

export const metadata: Metadata = { title: "Wishlist" };

export default function WishlistPage() {
  return (
    <div className="container-wide pt-5">
      <h1 className="font-display text-3xl sm:text-4xl">Wishlist</h1>
      <WishlistView />
    </div>
  );
}
