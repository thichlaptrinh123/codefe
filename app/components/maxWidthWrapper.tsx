import React from "react";
export default function MaxWidthWrapper({  children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[1280px] mx-auto">
        {children}
      </div>
  );
}