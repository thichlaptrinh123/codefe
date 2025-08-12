// app/admin/components/user/role-utils.ts

export type UserRole = "admin" | "product-lead" | "content-lead" | "customer";

export function convertRoleToDb(roleFromUI: string): string {
  const map: Record<string, string> = {
    "admin": "admin",
    "product-lead": "product-lead",
    "content-lead": "content-lead",
    "customer": "customer",
  };
  return map[roleFromUI] || "customer";
}

// Map từ DB role về tên hiển thị tiếng Việt
export const roleMap: Record<
  "admin" | "product-lead" | "content-lead" | "customer",
  string
> = {
  admin: "Quản trị hệ thống ",
  "product-lead": "Quản lý vận hành",
  "content-lead": "Quản lý truyền thông",
  customer: "Khách hàng",
};
