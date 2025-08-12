'use client';

import { useCartStore } from '@/store/cartStore';

interface Props {
  shippingFee: number | null;
  shippingType: 'road' | 'fly';
  finalTotal: number;
  totalPrice: number;
}

export default function OrderSummary({
  shippingFee,
  shippingType,
  finalTotal,
  totalPrice,
}: Props) {
  const cartItems = useCartStore((state) => state.items);

  return (
    <div className="order-summary">
      {cartItems.map((item, index) => (
        <div className="item" key={index}>
          <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} width={60} height={60} />
          <div className="details">
            <div className="title">{item.name}</div>
           <div className="option">
            Màu sắc:{' '}
            <span className="color-label">{item.color}</span>
            <span
              className="color"
              style={{
                backgroundColor: item.hex || item.color,
                border: '1px solid #aaa',
                display: 'inline-block',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                marginLeft: '6px',
                verticalAlign: 'middle',
              }}
              title={item.color}
            />
          </div>

            {item.size && (
              <div className="option">
                Size: <span className="size">{item.size}</span>
              </div>
            )}
          </div>
          <div className="price">
            {item.quantity} ×{' '}
            <strong>
              {(item.price * (1 - (item.sale || 0) / 100)).toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })}
            </strong>
          </div>
        </div>
      ))}

      <div className="discount">
        <input type="text" placeholder="Mã giảm giá" />
        <button>Áp dụng</button>
      </div>

      <div className="discount-codes">
        {[130000, 80000, 50000, 30000].map((val, i) => (
          <button key={i}>Mã giảm giá {val.toLocaleString()}VNĐ</button>
        ))}
      </div>

      <div className="totals">
        <div className="line">
          <span>Tạm tính</span>
          <span>
            {totalPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </span>
        </div>

        <div className="line">
          <span>Phí vận chuyển</span>
          <span>
            {shippingFee !== null
              ? `${shippingFee.toLocaleString('vi-VN')}₫`
              : 'Đang tính...'}
          </span>
        </div>

        <div className="line total">
          <span>Tổng cộng</span>
          <span>
            {finalTotal.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </span>
        </div>
      </div>
    </div>
  );
}
