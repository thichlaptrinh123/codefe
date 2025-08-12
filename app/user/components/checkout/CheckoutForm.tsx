import React, { useEffect, useState } from 'react';

interface Ward {
  name: string;
  mergedFrom?: string[];
}

interface ProvinceData {
  province: string;
  wards: Ward[];
}

interface ShippingInfo {
  name: string;
  phone: string;
  address: string;
  note: string;
}

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  street: string; // địa chỉ cụ thể
  // các trường khác nếu có
}

interface Props {
  shippingInfo: ShippingInfo;
  setShippingInfo: React.Dispatch<React.SetStateAction<ShippingInfo>>;
  selectedProvince: string;
  setSelectedProvince: (val: string) => void;
  selectedWard: string;
  setSelectedWard: (val: string) => void;
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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const userId = user?.id || user?._id;
    if (!userId) return;

    setLoading(true);
    fetch(`/api/user/address?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
      })
      .catch((err) => {
        console.error('Lỗi lấy địa chỉ:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSelectAddress = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSelectedAddressId(selectedId);

    const addr = addresses.find((a) => a._id === selectedId);
    if (!addr) return;

    setShippingInfo({
      name: addr.fullName,
      phone: addr.phone,
      address: addr.street,
      note: shippingInfo.note,
    });
    setSelectedProvince(addr.province);
    setSelectedWard(addr.ward);
  };

  return (
    <>
      {loading ? (
        <p>Đang tải địa chỉ...</p>
      ) : (
        <>
          <select value={selectedAddressId} onChange={handleSelectAddress} className="w-full p-2 border rounded mb-4">
            <option value="">Chọn địa chỉ đã lưu</option>
            {addresses.map((a) => (
              <option key={a._id} value={a._id}>
                {`${a.fullName} - ${a.phone} - ${a.street}, ${a.ward}, ${a.province}`}
              </option>
            ))}
          </select>

          <form className="shipping-form space-y-4">
            <input
              type="text"
              placeholder="Họ và tên"
              required
              value={shippingInfo.name}
              onChange={(e) => setShippingInfo((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              required
              value={shippingInfo.phone}
              onChange={(e) => setShippingInfo((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full p-2 border rounded"
            />
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
            <input
              type="text"
              placeholder="Địa chỉ (số nhà, tên đường...)"
              required
              value={shippingInfo.address}
              onChange={(e) => setShippingInfo((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Ghi chú đơn hàng (tuỳ chọn)"
              value={shippingInfo.note}
              onChange={(e) => setShippingInfo((prev) => ({ ...prev, note: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </form>
        </>
      )}
    </>
  );
}
