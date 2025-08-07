'use client';

import React from 'react';

interface Ward {
  name: string;
  mergedFrom: string[];
}

interface ProvinceData {
  province: string;
  wards: Ward[];
}

interface Props {
  shippingInfo: {
    name: string;
    phone: string;
    address: string;
    note: string;
  };
  setShippingInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    phone: string;
    address: string;
    note: string;
  }>>;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
  selectedWard: string;
  setSelectedWard: (ward: string) => void;
  provinces: ProvinceData[];
  wards: Ward[];
}

export default function CheckoutForm({
  shippingInfo,
  setShippingInfo,
  selectedProvince,
  setSelectedProvince,
  selectedWard,
  setSelectedWard,
  provinces,
  wards,
}: Props) {
  return (
    <form className="shipping-form space-y-4">
      {/* Họ và tên */}
      <input
        type="text"
        placeholder="Họ và tên"
        required
        value={shippingInfo.name}
        onChange={(e) =>
          setShippingInfo((prev) => ({ ...prev, name: e.target.value }))
        }
        className="w-full p-2 border rounded"
      />

      {/* Số điện thoại */}
      <input
        type="tel"
        placeholder="Số điện thoại"
        required
        value={shippingInfo.phone}
        onChange={(e) =>
          setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))
        }
        className="w-full p-2 border rounded"
      />

      {/* Tỉnh / Phường */}
      <div className="flex gap-2">
        <select
          value={selectedProvince}
          onChange={(e) => {
            setSelectedProvince(e.target.value);
            setSelectedWard('');
          }}
          className="w-1/2 p-2 border rounded"
        >
          <option value="">Chọn tỉnh / thành</option>
          {provinces.map((p) => (
            <option key={p.province} value={p.province}>
              {p.province}
            </option>
          ))}
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          disabled={!wards.length}
          className="w-1/2 p-2 border rounded"
        >
          <option value="">Chọn phường / xã</option>
          {wards.map((w) => (
            <option key={w.name} value={w.name}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Địa chỉ cụ thể */}
      <input
        type="text"
        placeholder="Địa chỉ (số nhà, tên đường...)"
        required
        value={shippingInfo.address}
        onChange={(e) =>
          setShippingInfo((prev) => ({ ...prev, address: e.target.value }))
        }
        className="w-full p-2 border rounded"
      />

      {/* Ghi chú */}
      <textarea
        placeholder="Ghi chú đơn hàng (tuỳ chọn)"
        value={shippingInfo.note}
        onChange={(e) =>
          setShippingInfo((prev) => ({ ...prev, note: e.target.value }))
        }
        className="w-full p-2 border rounded"
      />
    </form>
  );
}
