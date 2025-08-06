import React from "react";
import clsx from "clsx";

interface BaseDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export default function BaseDescription({ children, className }: BaseDescriptionProps) {
  return (
    <p className={clsx("text-body2 text-muted-foreground font-roboto", className)}>
      {children}
    </p>
  );
}
