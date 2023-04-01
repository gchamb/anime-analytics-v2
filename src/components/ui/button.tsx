import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"active:scale-95 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-aa-2-400 focus:ring-offset-2 dark:hover:bg-aa-3 dark:hover:bg-aa-3  disabled:opacity-50 dark:focus:ring-aa-2 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-aa-1 dark:data-[state=open]:bg-aa-dark-2",
	{
		variants: {
			variant: {
				default: "bg-black text-aa-1 hover:bg-aa-1 hover:text-black",
				destructive: "bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600",
				outline: "bg-transparent border border-black hover:bg-aa-1 dark:border-aa-3 dark:text-slate-100 dark:hover:text-aa-dark-0",
				subtle: "bg-aa-1 text-black hover:bg-aa-2 dark:bg-aa-dark-1 dark:hover:bg-aa-dark-2 dark:text-aa-3",
				ghost:
					"bg-transparent hover:bg-black hover:text-aa-1 dark:hover:bg-aa-3 dark:text-slate-100 dark:hover:text-aa-dark-0 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent",
				link: "bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent",
			},
			size: {
				default: "h-10 py-2 px-4",
				sm: "h-9 px-2 rounded-md",
				lg: "h-11 px-8 rounded-md",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	}
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
	return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
