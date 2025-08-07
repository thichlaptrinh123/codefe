'use client';

import React, { useState, useEffect } from 'react';


interface Order {
  _id: string;
  total: number;
  createdAt: string;
  status: string;
  shipping_type: string;
  payment_status: string;
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserId(parsed._id);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/order/user/${userId}`);
        const result = await res.json();
        if (result.success) {
          setOrders(result.orders);
        }
      } catch (err) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("Bạn có chắc muốn hủy đơn hàng này?");
    if (!confirmCancel) return;

    try {
      const res = await fetch(`/api/order/${orderId}/cancel`, {
        method: 'PUT',
      });

      const result = await res.json();

      if (result.success) {
        alert("Đã hủy đơn hàng.");
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId ? { ...order, status: 'cancelled' } : order
          )
        );
      } else {
        alert(result.message || "Hủy đơn hàng thất bại.");
      }
    } catch (err) {
      console.error("❌ Lỗi khi hủy đơn hàng:", err);
      alert("Đã có lỗi xảy ra.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Lịch sử đơn hàng</h2>

      {loading ? (
        <p className="text-gray-500">Đang tải đơn hàng...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Mã đơn</th>
                <th className="px-4 py-2 text-left">Ngày đặt</th>
                <th className="px-4 py-2 text-left">Tổng tiền</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-2">{order._id}</td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{order.total.toLocaleString()}₫</td>
                  <td className="px-4 py-2 capitalize">{order.status}</td>
                  <td className="px-4 py-2 space-x-2">
                    <a
                      href={`/user/account/orderdetail/${order._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </a>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="text-red-600 hover:underline"
                      >
                        Hủy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
