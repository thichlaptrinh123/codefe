// app/admin/components/order/order.ts

export interface ProductItem {
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  id: string;
  order_code?: string; 
  customerName: string;
  address: string;
  createdAt: string;
  updatedAt?: string;
  products: ProductItem[];
  shippingFee: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod: string;
  note?: string;


    shippingPartner?: string;
}


export const ORDER_STATUS: Record<string, string> = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao",
    delivered: "Đã giao",
    completed: "Hoàn tất",
    cancelled: "Đã hủy",
    failed: "Giao thất bại",
    return_requested: "Yêu cầu trả hàng",
    returned: "Đã trả hàng",
    refunded: "Đã hoàn tiền",
  };
  
  export const STATUS_STYLE: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-orange-100 text-orange-700",
    shipping: "bg-indigo-100 text-indigo-700",
    delivered: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
    failed: "bg-red-200 text-red-800",
    return_requested: "bg-pink-100 text-pink-700",
    returned: "bg-gray-200 text-gray-700",
    refunded: "bg-purple-100 text-purple-700",
  };
  
  export const ORDER_FLOW = [
    "pending",          // Chờ xác nhận
    "confirmed",        // Đã xác nhận
    "processing",       // Đang xử lý / chuẩn bị
    "shipping",         // Đang giao
    "delivered",        // Đã giao
    "completed",        // Hoàn tất (người dùng nhận hàng & không khiếu nại)
  ];

  export const SPECIAL_STATUSES = [
    "cancelled",        // Đã hủy
    "failed",           // Giao thất bại
    "return_requested", // Yêu cầu trả hàng
    "returned",         // Đã trả hàng
    "refunded",         // Đã hoàn tiền
  ];

 /**
 * Kiểm tra xem có cho phép chuyển từ trạng thái hiện tại (`from`)
 * sang trạng thái đặc biệt (`to`) hay không.
 *
 * @param from - Trạng thái hiện tại của đơn hàng
 * @param to - Trạng thái đích muốn chuyển đến
 * @param paymentMethod - Phương thức thanh toán (chỉ dùng cho "refunded")
 */
export const allowSpecialStatus = (
  from: string,
  to: string,
  paymentMethod?: string
): boolean => {
  switch (to) {
    case "cancelled":
      // ❌ Chỉ cho phép hủy nếu đơn chưa giao hoặc ship thất bại
      return ["pending", "confirmed", "processing", "failed"].includes(from);

    case "failed":
      // ❌ Giao hàng thất bại chỉ xảy ra nếu đang giao
      return from === "shipping";

    case "return_requested":
      // 🔁 Khách chỉ có thể yêu cầu trả hàng khi đơn đã giao thành công
      return from === "delivered";

    case "returned":
      // ✅ Chuyển sang "đã trả hàng" khi có yêu cầu trả hàng trước đó
      return from === "return_requested";

    case "refunded":
      // 💸 Chỉ hoàn tiền sau khi hàng đã được trả và thanh toán qua bank/ewallet
      return (
        from === "returned" &&
        ["bank", "ewallet"].includes(paymentMethod || "")
      );

    case "completed":
      // ✅ Hoàn tất đơn hàng nếu đã giao mà không trả hàng
      return from === "delivered";

    default:
      return false;
  }
};

export const STATUS_NOTES: Record<string, string> = {
  pending: "Đơn hàng mới được tạo và đang chờ xác nhận từ cửa hàng.",
  confirmed: "Cửa hàng đã xác nhận đơn hàng và chuẩn bị xử lý.",
  shipping: "Đơn hàng đã được giao cho đơn vị vận chuyển và đang trên đường tới khách hàng.",
  completed: "Khách hàng đã nhận được hàng và hoàn tất đơn hàng thành công.",
  cancelled: "Đơn hàng đã bị hủy bởi khách hàng hoặc cửa hàng trước khi giao hàng.",
  refunded: "Khách hàng đã được hoàn lại tiền cho đơn hàng này.",
  return_requested: "Khách hàng đã yêu cầu trả lại hàng sau khi nhận.",
  returned: "Cửa hàng đã nhận lại hàng từ khách sau khi trả.",
  failed: "Giao hàng không thành công, đơn hàng không thể hoàn tất.",
};
