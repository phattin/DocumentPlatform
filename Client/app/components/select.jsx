import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"
import clsx from "clsx"

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value

export const SelectTrigger = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
      ref={ref}
      className={clsx(
        "flex h-11 w-[180px] items-center justify-between",
        "rounded-full border border-white/15",
        "px-5 text-sm text-white",
        "hover:border-white/30 transition",
        "focus:outline-none focus:ring-1 focus:ring-white/30",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="h-4 w-4 opacity-60" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
)
SelectTrigger.displayName = "SelectTrigger"

export const SelectContent = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        className={clsx(
          "z-50 min-w-[180px] overflow-hidden rounded-xl",
          "border border-white/10 bg-[#111322]",
          "shadow-2xl p-1",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
)
SelectContent.displayName = "SelectContent"

export const SelectItem = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={clsx(
        "relative flex w-full cursor-pointer select-none items-center",
        "rounded-lg px-4 py-2 text-sm text-white",
        "hover:bg-white/10 focus:bg-white/10",
        "data-[state=checked]:bg-white/10",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>
        {children}
      </SelectPrimitive.ItemText>

      <SelectPrimitive.ItemIndicator className="absolute right-3">
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
)
SelectItem.displayName = "SelectItem"