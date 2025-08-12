
// app/api/product/route.ts
import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongodb";
import Product from "@/model/products";
import "@/model/categories";

// GET: Lấy tất cả sản phẩm, có populate danh mục
export async function GET() {
  await dbConnect();

  try {
    const products = await Product.find().populate("id_category");
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json(
      { message: "Lỗi khi lấy sản phẩm", error: (err as Error).message },
      { status: 500 }
    );
  }
}

// POST: Tạo sản phẩm mới
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
      // Sau khi lấy body:
      const body = await req.json();

      // 👉 Nếu bạn có truyền kèm id (để phân biệt create / edit)
      const isEditing = !!body._id;

      // ⚠️ Kiểm tra tên trùng CHỈ KHI tạo mới
      if (!isEditing) {
        const existing = await Product.findOne({
          name: { $regex: `^${body.name}$`, $options: "i" },
        });

        if (existing) {
          return NextResponse.json(
            { message: "Tên sản phẩm đã tồn tại" },
            { status: 409 }
          );
        }
      }


    // Chuẩn hoá ảnh
    if (!Array.isArray(body.images)) {
      body.images = typeof body.images === "string" ? [body.images] : [];
    }

    const newProduct = await Product.create({
      name: body.name,
      id_category: body.id_category,
      images: body.images,
      // image: body.images[0] || "",
      price: Number(body.price),
      sale: Number(body.sale || 0),
      product_hot: Number(body.product_hot || 0),
      product_new: body.product_new === 1 ? 1 : 0,
      isActive: body.isActive !== false,
      description: body.description || "",
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { message: "Lỗi khi tạo sản phẩm", error: (err as Error).message },
      { status: 500 }
    );
  }
}




// // app/api/product/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { dbConnect } from "@/lib/mongodb";
// import Product from "@/model/products";
// import "@/model/categories";
// // import Variant from "@/model/variants"; // cần để tính tồn kho

// //GET: Lấy tất cả sản phẩm, có populate danh mục
// export async function GET() {
//   await dbConnect();

//   try {
//     const products = await Product.find().populate("id_category");
//     return NextResponse.json(products);
//   } catch (err) {
//     return NextResponse.json(
//       { message: "Lỗi khi lấy sản phẩm", error: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }
// // export async function GET(req: NextRequest) {
// //   await dbConnect();

// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const page = parseInt(searchParams.get("page") || "1");
// //     const limit = parseInt(searchParams.get("limit") || "5");
// //     const statusFilter = searchParams.get("status") || "all";

// //     const skip = (page - 1) * limit;

// //     // Tạo map để lọc sản phẩm theo stock trước khi query
// //     const matchStage: any = {};

// //     if (statusFilter !== "all") {
// //       // lấy tất cả ID của sản phẩm trước
// //       const allRawProducts = await Product.find({}, { _id: 1 }).lean();
// //       const allProductIds = allRawProducts.map((p) => p._id);

// //       const allVariants = await Variant.aggregate([
// //         {
// //           $match: { product_id: { $in: allProductIds } },
// //         },
// //         {
// //           $group: {
// //             _id: "$product_id",
// //             stock: { $sum: "$stock_quantity" },
// //           },
// //         },
// //       ]);

// //       const idMatch: string[] = [];

// //       for (const item of allVariants) {
// //         const stock = item.stock || 0;

// //         if (
// //           (statusFilter === "sold-out" && stock === 0) ||
// //           (statusFilter === "low-stock" && stock > 0 && stock <= 20)
// //         ) {
// //           idMatch.push(String(item._id));
// //         }
// //       }

// //       // Nếu không có sản phẩm nào phù hợp, trả về rỗng sớm
// //       if (idMatch.length === 0) {
// //         return NextResponse.json({
// //           data: [],
// //           total: 0,
// //           currentPage: page,
// //           totalPages: 0,
// //         });
// //       }

// //       matchStage._id = { $in: idMatch.map((id) => new mongoose.Types.ObjectId(id)) };
// //     }

// //     const rawProducts = await Product.find(matchStage, {
// //       name: 1,
// //       price: 1,
// //       sale: 1,
// //       images: 1,
// //       isActive: 1,
// //       createdAt: 1,
// //       id_category: 1,
// //       viewCount: 1,
// //     })
// //       .populate("id_category", "name")
// //       .skip(skip)
// //       .limit(limit)
// //       .sort({ createdAt: -1 })
// //       .lean();

// //     const productIds = rawProducts.map((p) => p._id);

// //     const allVariants = await Variant.find({
// //       product_id: { $in: productIds },
// //     }).lean();

// //     const products = rawProducts.map((product) => {
// //       const variants = allVariants.filter(
// //         (v) => String(v.product_id) === String(product._id)
// //       );

// //       const stock = variants.reduce(
// //         (sum, v) => sum + Number(v.stock_quantity || 0),
// //         0
// //       );
// //       const sold = variants.reduce(
// //         (sum, v) => sum + Number(v.sold_quantity || 0),
// //         0
// //       );
// //       const featuredScore = (product.viewCount || 0) * 0.5 + sold * 2;
// //       const featuredLevel = featuredScore >= 5 ? 1 : 0;

// //       const displayStatus = !product.isActive
// //         ? "inactive"
// //         : stock === 0
// //         ? "sold-out"
// //         : stock <= 20
// //         ? "low-stock"
// //         : "active";

// //       return {
// //         id: product._id,
// //         name: product.name,
// //         price: product.price,
// //         discount: product.sale || 0,
// //         image: product.images?.[0] || "",
// //         images: product.images || [],
// //         description: "",
// //         stock,
// //         status: product.isActive ? "active" : "inactive",
// //         category: product.id_category?._id || "",
// //         categoryName: product.id_category?.name || "Không xác định",
// //         isNew: Date.now() - new Date(product.createdAt).getTime() <
// //           7 * 24 * 60 * 60 * 1000,
// //         featuredLevel,
// //         displayStatus,
// //         variants,
// //       };
// //     });

// //     return NextResponse.json({
// //       data: products,
// //       total: products.length,
// //       currentPage: page,
// //       totalPages: Math.ceil(products.length / limit),
// //     });
// //   } catch (err) {
// //     return NextResponse.json(
// //       { message: "Lỗi khi lấy sản phẩm", error: (err as Error).message },
// //       { status: 500 }
// //     );
// //   }
// // }



// // POST: Tạo sản phẩm mới
// export async function POST(req: NextRequest) {
//   await dbConnect();

//   try {
//       // Sau khi lấy body:
//       const body = await req.json();

//       // 👉 Nếu bạn có truyền kèm id (để phân biệt create / edit)
//       const isEditing = !!body._id;

//       // ⚠️ Kiểm tra tên trùng CHỈ KHI tạo mới
//       if (!isEditing) {
//         const existing = await Product.findOne({
//           name: { $regex: `^${body.name}$`, $options: "i" },
//         });

//         if (existing) {
//           return NextResponse.json(
//             { message: "Tên sản phẩm đã tồn tại" },
//             { status: 409 }
//           );
//         }
//       }


//     // Chuẩn hoá ảnh
//     if (!Array.isArray(body.images)) {
//       body.images = typeof body.images === "string" ? [body.images] : [];
//     }

//     const newProduct = await Product.create({
//       name: body.name,
//       id_category: body.id_category,
//       images: body.images,
//       // image: body.images[0] || "",
//       price: Number(body.price),
//       sale: Number(body.sale || 0),
//       product_hot: Number(body.product_hot || 0),
//       product_new: body.product_new === 1 ? 1 : 0,
//       isActive: body.isActive !== false,
//       description: body.description || "",
//     });

//     return NextResponse.json(newProduct, { status: 201 });
//   } catch (err) {
//     return NextResponse.json(
//       { message: "Lỗi khi tạo sản phẩm", error: (err as Error).message },
//       { status: 500 }
//     );
//   }
// }

