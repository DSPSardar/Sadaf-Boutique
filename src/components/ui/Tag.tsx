import { cn } from "@/lib/cn";

/** Small uppercase label for "New", "Sale", "Sold out" etc. */
export function Tag({ children, tone = "ink", className }: { children: React.ReactNode; tone?: "ink" | "sale" | "muted"; className?: string }) {
  const tones = {
    ink: "bg-ink text-ivory",
    sale: "bg-oxblood text-ivory",
    muted: "bg-sand text-muted",
  };
  return <span className={cn("inline-flex h-5 items-center rounded-xs px-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]", tones[tone], className)}>{children}</span>;
}
