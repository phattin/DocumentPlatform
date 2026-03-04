import React from "react";
import clsx from "clsx";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-primary text-white",
    secondary: "bg-white/10 text-white",
    outline: "border border-white/10 text-white",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}