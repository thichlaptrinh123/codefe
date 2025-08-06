// components/OrderDetailModal.tsx
'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import Image from 'next/image';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Có thể tạo interface cụ thể hơn
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Panel className="bg-white max-w-3xl w-full rounded-lg shadow-lg p-6">
          <Dialog.Title className="text-xl font-semibold mb-4">Chi tiết đơn hàng</Dialog.Title>

          <div className="grid gap-2 text-sm text-gray-600 mb-4">
            <p><strong>Mã đơn:</strong> {order._id}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Trạng thái:</strong> {order.status}</p>
            <p><strong>Người nhận:</strong> {order.receiver_name} - {order.receiver_phone}</p>
            <p><strong>Địa chỉ:</strong> {order.address}, {order.ward}, {order.district}, {order.province}</p>
            <p><strong>Ghi chú:</strong> {order.note || 'Không có'}</p>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Sản phẩm</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {order.products.map((p: any) => (
                <div key={p._id} className="flex items-center gap-4 border-b pb-2">
                  <Image
                    src={p.id_product_variant.id_product.images?.[0] || '/no-image.jpg'}
                    alt={p.id_product_variant.id_product.name}
                    width={60}
                    height={60}
                    className="rounded object-cover"
                  />
                  <div>
                    <p className="font-medium">{p.id_product_variant.id_product.name}</p>
                    <p className="text-sm text-gray-500">Màu: {p.id_product_variant.color}, Size: {p.id_product_variant.size}</p>
                    <p>Số lượng: {p.quantity}</p>
                    <p>Giá: {(p.price * p.quantity).toLocaleString()}₫</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            <p><strong>Phí vận chuyển:</strong> {order.shipping_fee.toLocaleString()}₫</p>
            <p><strong>Tổng cộng:</strong> {(order.total).toLocaleString()}₫</p>
          </div>

          <div className="text-right mt-6">
            <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">
              Đóng
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default OrderDetailModal;
