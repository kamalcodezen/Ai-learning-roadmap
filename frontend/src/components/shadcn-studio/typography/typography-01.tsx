import { cn } from "@/lib/utils";
import React from "react";

export const TypographyH1 = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h1 className={cn('text-4xl font-extrabold text-balance', className)} {...props}>
      {children}
    </h1>
  )
}
