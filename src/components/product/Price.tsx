import { cn } from "@/lib/cn";
import { discountPercent, formatPKR } from "@/lib/format";

interface PriceProps {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Price({ price, compareAtPrice, size = "sm", className }: PriceProps) {
  const pct = discountPercent(price, compareAtPrice);
  const sizes = { sm: "text-[13px]", md: "text-[15px]", lg: "text-xl" };
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", sizes[size], className)}>
      <span className={cn("font-medium tabular-nums", pct ? "text-oxblood" : null)}>{formatPKR(price)}</span>
      {pct ? (
        <>
          <s className="text-muted tabular-nums">{formatPKR(compareAtPrice!)}</s>
          <span className="text-[11px] font-medium text-oxblood">−{pct}%</span>
        </>
      ) : null}
    </span>
  );
}
