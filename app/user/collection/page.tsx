"use client";

import React, { useEffect, useState } from "react";
import "../user_css/collection.css"
import Link from "next/link"; // ✅ sửa đúng chữ hoa
import MaxWidthWrapper from "../../components/maxWidthWrapper";
import Image from "next/image";

interface Collection {
  _id: string;
  name: string;
  thumbnail_url: string;
  description: string;
}

export default function CollectionPage() {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchCollections = async () => {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (data.success) {
        setCollections(data.data);
      }
    };
    fetchCollections();
  }, []);

  return (
    <section className="collection">
      <div className="breadcrumb-collection">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Bộ sưu tập</span>
        </MaxWidthWrapper>
      </div>

      <div className="banner-collection">
        <Image
          src="/images/image-collection.jpg" // ✅ dùng đường dẫn từ public
          alt="Banner bộ sưu tập"
          width={1280}
          height={600}
        />
      </div>

      <div className="container-collection">
        <div className="brand-collection">
          {collections.map((item) => (
            <div key={item._id}>
              <h2>{item.name}</h2>
              <div className="images-collection">
                <Image
                  src={item.thumbnail_url}
                  alt={item.name}
                  width={400}
                  height={600}
                />
              </div>
              <p className="content-collection">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
