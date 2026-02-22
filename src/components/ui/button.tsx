import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { triggerHaptic } from "@/lib/haptics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold font-display ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-2xl shadow-[0_4px_0_0_hsl(168_78%_32%)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(168_78%_32%)]",
        destructive: "bg-destructive text-destructive-foreground rounded-2xl shadow-[0_4px_0_0_hsl(4_82%_42%)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(4_82%_42%)]",
        outline: "border-2 border-border bg-card text-foreground hover:bg-muted rounded-2xl shadow-[0_4px_0_0_hsl(220_14%_82%)] active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(220_14%_82%)]",
        secondary: "bg-secondary text-secondary-foreground rounded-2xl shadow-[0_4px_0_0_hsl(199_90%_40%)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(199_90%_40%)]",
        ghost: "hover:bg-muted hover:text-foreground rounded-2xl",
        link: "text-primary underline-offset-4 hover:underline",
        // ToothyQuest special variants — chunky Duolingo-style
        hero: "gradient-hero text-primary-foreground rounded-2xl shadow-[0_5px_0_0_hsl(168_78%_30%)] hover:brightness-110 active:translate-y-[3px] active:shadow-[0_2px_0_0_hsl(168_78%_30%)] font-extrabold text-lg",
        playful: "bg-accent text-accent-foreground rounded-2xl shadow-[0_4px_0_0_hsl(42_100%_38%)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(42_100%_38%)]",
        coral: "gradient-warm text-primary-foreground rounded-2xl shadow-[0_4px_0_0_hsl(340_82%_48%)] hover:brightness-110 active:translate-y-[2px] active:shadow-[0_2px_0_0_hsl(340_82%_48%)]",
        adventure: "gradient-adventure text-primary-foreground rounded-2xl shadow-[0_5px_0_0_hsl(270_72%_44%)] hover:brightness-110 active:translate-y-[3px] active:shadow-[0_2px_0_0_hsl(270_72%_44%)] font-extrabold",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-10 text-lg",
        xl: "h-16 rounded-2xl px-12 text-xl",
        icon: "h-12 w-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  haptic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, haptic = true, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (haptic) {
        triggerHaptic('light');
      }
      onClick?.(e);
    };
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        onClick={handleClick}
        {...props} 
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
