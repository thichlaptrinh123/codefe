import React from "react";
import clsx from "clsx";
import Image from "next/image";

interface ServiceCardProps {
  imageSrc: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ServiceCard({imageSrc,title,children,className,}: ServiceCardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg px-3 py-6 shadow-card primary-foreground",
        "font-roboto text-center",
        className
      )}
    >
    {/* Img */}
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-[36px] overflow-hidden mx-auto">
      <Image
        src={imageSrc}
        alt="icon"
        width={100}
        height={102}
        className="object-contain"
      />
    </div>

        {/* Title */}
        <h4 className="text-h4 text-foreground mb-[24px]">{title}</h4>

        {/* Content */}
        <div className="text-body text-foreground ">{children}</div>
      </div>
    );
}
