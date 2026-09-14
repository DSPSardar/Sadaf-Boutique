import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-ink text-ivory hover:bg-black disabled:bg-muted",
  secondary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-ivory disabled:border-hairline disabled:text-muted",
  ghost: "bg-transparent text-ink hover:bg-sand",
  whatsapp: "bg-whatsapp text-white hover:bg-[#1ebe5b]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-[12px]",
  md: "h-11 px-5 text-[13px]",
  lg: "h-12 px-6 text-[13px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block, className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xs font-medium uppercase tracking-[0.14em] transition-colors duration-200 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        block && "w-full",
        className
      )}
      {...props}
    />
  );
});
