'use client';

interface Props {
  onSubmit: () => void;
}

export default function PaymentMethods({ onSubmit }: Props) {
  return (
    <div className="payment-methods">
      <h3>Phương thức thanh toán</h3>
      <label className="payment-option">
        <input type="radio" name="payment" defaultChecked />
        <img src="https://atlabel.vn/wp-content/uploads/2022/09/cash-on-delivery.png" alt="COD" />
        <span>Thanh toán khi giao hàng (COD)</span>
      </label>
      {/* <label className="payment-option">
        <input type="radio" name="payment" />
        <img src="https://images.seeklogo.com/logo-png/42/1/vnpay-logo-png_seeklogo-428006.png" alt="VNPAY" />
        <span>Thanh toán VNPAY</span>
      </label>
      <label className="payment-option">
        <input type="radio" name="payment" />
        <img src="https://images.seeklogo.com/logo-png/40/1/shopee-pay-logo-png_seeklogo-406839.png" alt="ShopeePay" />
        <span>Ví ShopeePay</span>
      </label>
      <label className="payment-option">
        <input type="radio" name="payment" />
        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" />
        <span>Ví MoMo</span>
      </label> */}
      <button className="submit-button" onClick={onSubmit}>Hoàn tất đơn hàng</button>
    </div>
  );
}