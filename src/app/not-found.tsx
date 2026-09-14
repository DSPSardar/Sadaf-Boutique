import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <main className="container-wide py-16">
      <Link href="/" className="font-display text-2xl uppercase tracking-[0.2em]">
        Sadaf Boutique
      </Link>
      <EmptyState
        title="We couldn’t find that page"
        description="The piece may have sold out or moved. Browse the current collection instead."
        action={
          <Link href="/shop">
            <Button>Back to shop</Button>
          </Link>
        }
      />
    </main>
  );
}
