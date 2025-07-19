"use client"
import React, { useState } from "react";

const Checkout = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckout = () => {
    setShowSuccess(true);

    // Ẩn box sau 3 giây
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <div className="p-4">
      <button
        onClick={handleCheckout}
        className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
      >
        Thanh toán
      </button>

      {showSuccess && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow animate-fade-in">
          🛒 Đặt hàng thành công!
        </div>
      )}
    </div>
  );
};

export default Checkout;