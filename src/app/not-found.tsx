import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="container-wide py-16">
      <EmptyState
        title="We couldn’t find that page"
        description="The piece may have sold out or moved. Browse the current collection instead."
        action={
          <Link href="/shop">
            <Button>Back to shop</Button>
          </Link>
        }
      />
    </div>
  );
}
