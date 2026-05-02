import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "rounded-lg bg-primary text-primary-foreground " +
          "shadow-[0_2px_0_rgba(0,0,0,0.25),0_4px_16px_rgba(91,111,212,0.35)] " +
          "hover:brightness-110 hover:shadow-[0_4px_4px_rgba(0,0,0,0.2),0_6px_20px_rgba(91,111,212,0.45)] hover:-translate-y-px " +
          "active:translate-y-px active:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_2px_8px_rgba(91,111,212,0.3)] active:brightness-95",
        destructive:
          "rounded-lg bg-destructive text-destructive-foreground " +
          "shadow-[0_2px_0_rgba(0,0,0,0.2),0_4px_14px_rgba(239,68,68,0.3)] " +
          "hover:brightness-110 hover:-translate-y-px " +
          "active:translate-y-px active:brightness-95",
        outline:
          "rounded-lg border border-border bg-background text-foreground " +
          "shadow-[0_1px_3px_rgba(0,0,0,0.08)] " +
          "hover:bg-muted hover:-translate-y-px hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] " +
          "active:translate-y-px active:shadow-none",
        secondary:
          "rounded-lg border bg-secondary text-secondary-foreground " +
          "shadow-[0_1px_3px_rgba(0,0,0,0.08)] " +
          "hover:brightness-95 hover:-translate-y-px " +
          "active:translate-y-px active:brightness-90",
        ghost:
          "rounded-lg text-foreground " +
          "hover:bg-muted " +
          "active:bg-muted/80",
        link: "text-primary underline-offset-4 hover:underline p-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs rounded-md",
        lg: "h-11 px-8 text-sm",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
