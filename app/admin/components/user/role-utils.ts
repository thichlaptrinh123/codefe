// app/admin/components/user/role-utils.ts

// Chuyển từ UI về đúng role enum trong DB
export function convertRoleToDb(roleFromUI: string): string {
    const map: Record<string, string> = {
      "admin": "admin",
      "product-manager": "product-manager",
      "order-manager": "order-manager",
      "post-manager": "post-manager",
      "customer": "customer",
    };
    return map[roleFromUI] || "customer";
  }
  
  // Map từ DB role về tên hiển thị tiếng Việt
  export const roleMap: Record<
    "admin" | "product-manager" | "order-manager" | "post-manager" | "customer",
    string
  > = {
    admin: "Admin tổng",
    "product-manager": "QL sản phẩm",
    "order-manager": "QL đơn hàng",
    "post-manager": "QL bài viết",
    customer: "Khách hàng",
  };
  