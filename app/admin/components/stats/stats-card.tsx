"use client";
import clsx from "clsx";
import { useEffect, useState } from "react";

const cardColors = [
  "from-[#F1F2F6] to-[#DDE0E7]",
  "from-[#F5F0E1] to-[#E2D9C5]",
  "from-[#F0EBF4] to-[#D5CFE1]",
  "from-[#EAF4F4] to-[#CBD8D8]",
];

export default function StatsCards() {
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [totalStock, setTotalStock] = useState<number | null>(null);
  const [orderStats, setOrderStats] = useState<{ total: number; completed: number } | null>(null);
  const [codHold, setCodHold] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/order");
        const data = await res.json();
  
        const total = data.length;
        const completed = data.filter((o: any) => o.status === "completed").length;
  
        setOrderStats({ total, completed });
      } catch (error) {
        console.error("Lỗi fetch order:", error);
        setOrderStats({ total: 0, completed: 0 });
      }
    };

    const fetchVoucher = async () => {
      try {
        const res = await fetch("/api/voucher");
        const data = await res.json();
        const activeVouchers = data.filter((v: any) => v.status === "active");
        setVoucherCount(activeVouchers.length);
      } catch (error) {
        console.error("Lỗi fetch voucher:", error);
        setVoucherCount(0);
      }
    };

    const fetchStock = async () => {
      try {
        const res = await fetch("/api/variant");
        const data = await res.json();
        const total = data.reduce((sum: number, v: any) => sum + (v.stock_quantity || 0), 0);
        setTotalStock(total);
      } catch (error) {
        console.error("Lỗi fetch stock:", error);
        setTotalStock(0);
      }
    };

    fetchOrders();
    fetchVoucher();
    fetchStock();
  }, []);

  useEffect(() => {
    const fetchCodHold = async () => {
      try {
        const res = await fetch("/api/ghtk/cod-hold");
        const data = await res.json();
        setCodHold(data.cod_hold || 0);
      } catch (error) {
        console.error("Lỗi fetch COD GHTK:", error);
        setCodHold(0);
      }
    };
  
    fetchCodHold();
    const interval = setInterval(fetchCodHold, 30000); // 30s fetch lại
  
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Đơn hoàn tất / Tổng đơn",
      icon: "bx-cart",
      value: orderStats !== null ? `${orderStats.completed} / ${orderStats.total}` : "Đang tải...",
    },
    {
      title: "Số lượng tồn kho",
      icon: "bx-package",
      value: totalStock !== null ? totalStock.toLocaleString("vi-VN") : "Đang tải...",
    },
    {
      title: "Voucher đang hoạt động",
      icon: "bx-gift",
      value: voucherCount !== null ? `${voucherCount} mã` : "Đang tải...",
    },
    {
      title: "Tiền thu hộ đang tạm giữ",
      icon: "bx-money",
      value:
        codHold !== null
          ? codHold.toLocaleString("vi-VN") + " VNĐ"
          : "Đang tải...",
    }
  ];

return (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((item, index) => (
      <div
        key={index}
        className={clsx(
          "p-5 rounded-2xl bg-gradient-to-br",
          cardColors[index % cardColors.length],
          "border border-gray-200 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 ease-in-out"
        )}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 flex items-center justify-center bg-white/60 text-gray-700 rounded-full shadow-inner">
            <i className={`bx ${item.icon} text-xl`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] text-gray-600">{item.title}</span>
            <span className="text-[16px] font-semibold text-gray-800">
              {item.value}
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
);
}