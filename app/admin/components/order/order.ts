// app/admin/constants/order.ts

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
  