import * as React from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "warning";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    // Style mappings following our professional enterprise design rules
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none shadow-subtle rounded-md";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary border border-transparent",
      secondary: "bg-brandgray-light text-brandgray-text hover:bg-gray-200 active:bg-gray-150 border border-brandgray-border",
      outline: "bg-transparent text-brandgray-text hover:bg-brandgray-light active:bg-gray-100 border border-brandgray-border",
      ghost: "bg-transparent text-brandgray-text hover:bg-brandgray-light active:bg-gray-100 shadow-none border border-transparent",
      success: "bg-success text-white hover:bg-success-hover active:bg-success border border-transparent",
      warning: "bg-warning text-white hover:bg-warning-hover active:bg-warning border border-transparent",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-11 px-6 text-lg",
    };

    return (
      <button
        type={type}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
