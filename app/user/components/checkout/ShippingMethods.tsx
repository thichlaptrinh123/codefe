'use client';

interface Props {
  shippingType: 'road' | 'fly';
  setShippingType: (val: 'road' | 'fly') => void;
  shippingFeeRoad: number | null;
  shippingFeeFly: number | null;
}

export default function ShippingMethods({
  shippingType,
  setShippingType,
  shippingFeeRoad,
  shippingFeeFly,
}: Props) {
  return (
    <div className="shipping-methods">
      <h3>Phương thức vận chuyển</h3>

      <label className="shipping-option">
        <input
          type="radio"
          name="shipping"
          value="road"
          checked={shippingType === 'road'}
          onChange={() => setShippingType('road')}
        />
        <div className="option-info">
          <div className="main-text">Giao hàng tiết kiệm</div>
          <div className="sub-text">Nhận hàng dự kiến: 3–5 ngày</div>
        </div>
        <div className="price">
          {shippingFeeRoad !== null ? `${shippingFeeRoad.toLocaleString()}₫` : 'Đang tính...'}
        </div>
      </label>

      <label className="shipping-option">
        <input
          type="radio"
          name="shipping"
          value="fly"
          checked={shippingType === 'fly'}
          onChange={() => setShippingType('fly')}
        />
        <div className="option-info">
          <div className="main-text">Giao hỏa tốc</div>
          <div className="sub-text">Nhận hàng dự kiến: 1–2 ngày</div>
        </div>
        <div className="price">
          {shippingFeeFly !== null ? `${shippingFeeFly.toLocaleString()}₫` : 'Đang tính...'}
        </div>
      </label>
    </div>
  );
}
