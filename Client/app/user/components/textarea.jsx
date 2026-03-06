import React from "react";
import clsx from "clsx";

export const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "flex w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm text-white",
          "placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";