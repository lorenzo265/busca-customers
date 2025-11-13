import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium transition duration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-codex-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary: "bg-codex-blue text-white shadow-subtle hover:bg-[#0284d0]",
        secondary: "bg-white text-codex-navy border border-codex-blue/40 hover:border-codex-blue/60",
        ghost: "bg-transparent text-codex-blue hover:bg-codex-blue/10",
        danger: "bg-red-500 text-white hover:bg-red-600"
      },
      size: {
        sm: "px-3 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonStyles> & {
    isLoading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(buttonStyles({ variant, size }), className)} {...props}>
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}