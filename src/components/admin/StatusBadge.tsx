import type { ProductStatus } from "@/lib/supabase/types";
import { Tag } from "@/components/ui/Tag";

export function StatusBadge({ status }: { status: ProductStatus }) {
  if (status === "active") return <Tag tone="ink">Live</Tag>;
  if (status === "archived") return <Tag tone="sale">Archived</Tag>;
  return <Tag tone="muted">Draft</Tag>;
}
