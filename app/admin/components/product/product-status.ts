export type ProductStatus = "active" | "inactive" | "low-stock" | "sold-out";

export const productStatusLabel: Record<ProductStatus, string> = {
  active: "Hoạt động",
  inactive: "Tạm ngưng",
  "low-stock": "Gần hết hàng",
  "sold-out": "Hết hàng",
};

export const productStatusClass: Record<ProductStatus, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-red-100 text-red-600",
  "low-stock": "bg-orange-100 text-orange-700",
  "sold-out": "bg-gray-100 text-gray-600",
};

export const productStatusOptions: { label: string; value: ProductStatus }[] = [
  { label: "Hoạt động", value: "active" },
  { label: "Tạm ngưng", value: "inactive" },
  { label: "Gần hết hàng", value: "low-stock" },
  { label: "Hết hàng", value: "sold-out" },
];

export const productStatusManualOptions: { label: string; value: ProductStatus }[] = [
    { label: "Hoạt động", value: "active" },
    { label: "Tạm ngưng", value: "inactive" },
  ];
  