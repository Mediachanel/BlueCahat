import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  variant?: "primary" | "soft" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({ className, variant = "primary", size = "md", asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-60",
        variant === "primary" && "bg-bluechat-navy text-white shadow-soft hover:bg-bluechat-blue",
        variant === "soft" && "bg-bluechat-light text-bluechat-navy hover:bg-blue-100 dark:bg-slate-900 dark:text-blue-200",
        variant === "ghost" && "text-slate-600 hover:bg-blue-50 hover:text-bluechat-navy dark:text-slate-300 dark:hover:bg-slate-900",
        variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300",
        size === "sm" && "h-9 px-3",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10",
        className
      )}
      {...props}
    />
  );
}
