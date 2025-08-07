'use client';

import { useEffect, useState } from 'react';

const OrderDetailPage = ({ params }: { params: { id: string } }) => {
  const id = params.id; // ✅ Không cần use()

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatPhone = (phone: string) => {
  if (!phone) return '';
  return phone.replace(/^\+84/, '0');
};


  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/order/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error('❌ Lỗi khi lấy chi tiết đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng.</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>

     <div className="mb-6 space-y-1">
      <p><strong>Mã đơn:</strong> {order._id}</p>
      <p><strong>Người nhận:</strong> {order.receiver_name}</p>
      <p><strong>Số điện thoại:</strong> {formatPhone(order.receiver_phone)}</p>
      <p><strong>Địa chỉ:</strong> {order.address}</p>
      <p><strong>Voucher:</strong> {order.id_voucher?.code || 'Không áp dụng'}</p>
      <p><strong>Tổng tiền:</strong> {order.total.toLocaleString()} VND</p>
    </div>


      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Sản phẩm</th>
            <th className="border px-4 py-2 text-center">Màu</th>
            <th className="border px-4 py-2 text-center">Size</th>
            <th className="border px-4 py-2 text-right">Giá</th>
            <th className="border px-4 py-2 text-center">Số lượng</th>
            <th className="border px-4 py-2 text-right">Tổng</th>
          </tr>
        </thead>
        <tbody>
          {order.products.map((item: any, index: number) => {
            const variant = item.id_product_variant;
            const product = variant?.id_product;

            return (
              <tr key={index}>
                <td className="border px-4 py-2">{product?.name || 'N/A'}</td>
                <td className="border px-4 py-2 text-center">{variant?.color || 'N/A'}</td>
                <td className="border px-4 py-2 text-center">{variant?.size || 'N/A'}</td>
                <td className="border px-4 py-2 text-right">{variant?.price?.toLocaleString() || 0}</td>
                <td className="border px-4 py-2 text-center">{item.quantity}</td>
                <td className="border px-4 py-2 text-right">
                  {(variant?.price * item.quantity)?.toLocaleString() || 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetailPage;
