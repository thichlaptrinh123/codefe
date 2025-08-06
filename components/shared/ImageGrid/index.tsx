import React from "react";
import Image from "next/image";

interface ImageGridProps {
  images: string[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  return (
    <div className="grid grid-cols-12 gap-[20px] mt-9">
      {images.map((src, index) => {
        let colSpan = 3;
        if (index % 9 === 0 || index % 9 === 5 || index % 9 === 7) colSpan = 6;

        return (
          <div key={index} className={`col-span-${colSpan} relative w-full h-[385px]`}>
            <Image
              src={src}
              alt={`Living space ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        );
      })}
    </div>
  );
}
