import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/model/products";
import Variant from "@/model/variants";

export async function GET() {
  try {
    await dbConnect();

    const products = await Product.find().lean();

    const featuredProducts = await Promise.all(
      products.map(async (product) => {
        // Lượt xem giả lập nếu chưa có trường viewCount
        const viewCount = product.viewCount || 0;

        const variants = await Variant.find({ id_product: product._id }).lean();
        const totalSold = variants.reduce(
          (sum, variant) => sum + (variant.sold_quantity || 0),
          0
        );

        const featuredScore = viewCount * 0.5 + totalSold * 2;

        return {
          ...product,
          featuredScore,
          isFeatured: featuredScore >= 5,
        };
      })
    );

    // Trả về sản phẩm nổi bật
    const onlyFeatured = featuredProducts.filter((p) => p.isFeatured);

    return NextResponse.json(onlyFeatured);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm nổi bật:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
