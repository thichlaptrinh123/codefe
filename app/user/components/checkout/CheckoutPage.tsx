import React from 'react';

interface Props {
  shippingInfo: any;
  setShippingInfo: React.Dispatch<React.SetStateAction<any>>;
  selectedProvince: string;
  setSelectedProvince: (val: string) => void;
  selectedWard: string;
  setSelectedWard: (val: string) => void;
  provinces: { province: string; wards: any[] }[];
  wards: any[];
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
    <form className="shipping-form">
      <input type="text" placeholder="Họ và tên" required value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} />
      <input type="tel" placeholder="Số điện thoại" required value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} />
      <div className="select-group">
        <select value={selectedProvince} onChange={(e) => { setSelectedProvince(e.target.value); setSelectedWard(''); }}>
          <option value="">Chọn tỉnh / thành</option>
          {provinces.map((p) => <option key={p.province} value={p.province}>{p.province}</option>)}
        </select>
        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!wards.length}>
          <option value="">Chọn phường / xã</option>
          {wards.map((w) => <option key={w.name} value={w.name}>{w.name}</option>)}
        </select>
      </div>
      <input type="text" placeholder="Địa chỉ (số nhà, tên đường...)" required value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} />
      <textarea placeholder="Ghi chú đơn hàng" value={shippingInfo.note} onChange={(e) => setShippingInfo({ ...shippingInfo, note: e.target.value })} />
    </form>
  );
}
