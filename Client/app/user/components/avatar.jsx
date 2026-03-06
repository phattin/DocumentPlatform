import React from "react";
import clsx from "clsx";

export const Avatar = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        "relative flex items-center justify-center rounded-full overflow-hidden",
        className
      )}
      {...props}
    />
  );
};

export const AvatarFallback = ({ className, ...props }) => {
  return (
    <div
      className={clsx(
        "flex items-center justify-center w-full h-full font-semibold",
        className
      )}
      {...props}
    />
  );
};