import { Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function VideoBadge({ className }: { className?: string }) {
  return (
    <span
      aria-label="Has video"
      className={cn("inline-flex h-6 items-center gap-1 rounded-full bg-ink/70 pl-1.5 pr-2 text-[10px] font-medium uppercase tracking-[0.12em] text-ivory backdrop-blur-sm", className)}
    >
      <Play size={10} className="fill-current" />
      Video
    </span>
  );
}
