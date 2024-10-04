import * as React from "react";
import { cn } from "@/lib/utils";

// Interface that extends the default HTML attributes for input elements
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Forward ref to allow parent components to reference the input element
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props} // Spread additional props onto the input element
      />
    );
  }
);

// Display name for the input component
Input.displayName = "Input";

export { Input };
