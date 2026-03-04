import React, { createContext, useContext, useState } from "react";
import clsx from "clsx";

const TabsContext = createContext(null);

export const Tabs = ({ defaultValue, className, children }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }) => (
  <div className={clsx("flex gap-2", className)} {...props} />
);

export const TabsTrigger = ({ value, className, ...props }) => {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;

  return (
    <button
      onClick={() => ctx?.setValue(value)}
      className={clsx(
        "px-4 py-2 text-sm transition-all",
        active && "bg-primary text-white",
        className
      )}
      {...props}
    />
  );
};

export const TabsContent = ({ value, children }) => {
  const ctx = useContext(TabsContext);
  if (ctx?.value !== value) return null;
  return <div>{children}</div>;
};