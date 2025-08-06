import React from "react";

export default function BaseTitle({children,}: {children: React.ReactNode;}) {
  return (
    <h2 className="text-h2 font-roboto text-primary text-center">
      {children}
    </h2>
  );
}