import * as React from "react";
import { cn } from "@/lib/utils";

// Interface that extends the default HTML attributes for textarea elements
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

// Forward ref to allow parent components to reference the textarea element
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props} // Spread additional props onto the textarea element
      />
    );
  }
);

// Display name for the textarea component
Textarea.displayName = "Textarea";

export { Textarea };
