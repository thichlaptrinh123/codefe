import React from "react";
import ImageGrid from "@/components/shared/ImageGrid";
import BaseTitle from "@/components/shared/BaseTitle";
import BaseDescription from "@/components/shared/BaseDescription";
import MaxWidthWrapper from "@/components/shared/MaxWidthWrapper";

export default function LivingSpacesSection() {
  const images = [
    "/images/gallery_1.png",
    "/images/gallery_2.png",
    "/images/gallery_2.png",
    // "https://picsum.photos/400/500?random=2",
    // "https://picsum.photos/400/500?random=3",
    // "https://picsum.photos/800/500?random=1",
    // "https://picsum.photos/400/500?random=2",
    // "https://picsum.photos/800/500?random=1",
    // "https://picsum.photos/400/500?random=3",
  ];

  return (
    <section className="py-16 bg-background text-foreground">
      <MaxWidthWrapper>
        <BaseTitle>Our Living Spaces</BaseTitle>
        <BaseDescription className="text-center mt-6">
          Comfortable, clean, and personalized spaces where residents feel at home. Explore our beautifully maintained living environments.
        </BaseDescription>

            <ImageGrid images={images} />
            
      </MaxWidthWrapper>
    </section>
  );
}
