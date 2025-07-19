import React from "react";
export default function MaxWidthWrapper({  children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[11200px] mx-auto">
        {children}
      </div>
  );
}