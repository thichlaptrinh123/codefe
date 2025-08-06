'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '../../user_css/pay.css';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import CheckoutForm from '../components/checkout/CheckoutForm';
import ShippingMethods from '../components/checkout/ShippingMethods';
import PaymentMethods from '../components/checkout/PaymentMethods';
import OrderSummary from '../components/checkout/OrderSummary';

interface Ward {
  name: string;
  mergedFrom: string[];
}

interface ProvinceData {
  province: string;
  wards: Ward[];
}

export default function CheckoutPage() {
  const cartItems = useCartStore((state) => state.items);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * item.price * (1 - (item.sale || 0) / 100),
    0
  );

  const [data, setData] = useState<ProvinceData[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingType, setShippingType] = useState<'road' | 'fly'>('road');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  const [user, setUser] = useState<any>(null);

  const finalTotal = useMemo(() => totalPrice + (shippingFee || 0), [totalPrice, shippingFee]);
  const currentProvince = data.find((p) => p.province === selectedProvince);
  const wards = currentProvince?.wards || [];

  const [shippingFeeRoad, setShippingFeeRoad] = useState<number | null>(null);
  const [shippingFeeFly, setShippingFeeFly] = useState<number | null>(null);

  // 👉 Lấy user từ localStorage
useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.phone?.startsWith('+84')) {
        parsedUser.phone = '0' + parsedUser.phone.slice(3);
      }
      setUser(parsedUser); // ✅ phone đã chuẩn
    } catch (err) {
      console.error('Lỗi khi parse user:', err);
    }
  }
}, []);


  // 👉 Gán tên và SĐT người dùng vào shippingInfo nếu có user
  useEffect(() => {
    if (user) {
      setShippingInfo((prev) => ({
        ...prev,
        name: user.username || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('https://vietnamlabs.com/api/vietnamprovince')
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .catch((err) => console.error('Lỗi khi fetch tỉnh:', err));
  }, []);

  useEffect(() => {
    if (selectedProvince && selectedWard && shippingInfo.address) {
      calculateBothShippingFees();
    }
  }, [selectedProvince, selectedWard, shippingInfo.address, shippingType]);

  const calculateBothShippingFees = async () => {
    const fullAddress = `${shippingInfo.address}, ${selectedWard}, ${selectedProvince}`;

    const fetchFee = async (type: 'road' | 'fly') => {
      try {
        const res = await fetch('/api/calculate-shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pick_province: 'TP. Hồ Chí Minh',
            pick_district: 'Quận 1',
            province: selectedProvince,
            district: 'Không rõ',
            address: fullAddress,
            weight: 1000,
            value: 500000,
            transport: type,
          }),
        });

        const data = await res.json();
        return data.success ? data.fee.fee : null;
      } catch (err) {
        console.error(`Lỗi khi tính phí ${type}:`, err);
        return null;
      }
    };

    const [roadFee, flyFee] = await Promise.all([fetchFee('road'), fetchFee('fly')]);
    setShippingFeeRoad(roadFee);
    setShippingFeeFly(flyFee);
    setShippingFee(shippingType === 'road' ? roadFee : flyFee);
  };


//   useEffect(() => {
//   const fetchDistricts = async () => {
//     if (!selectedProvince) return;

//     try {
//       const res = await fetch(`/api/ghtk/districts?province=${selectedProvince}`);
//       const result = await res.json();
//       if (result.success) {
//         console.log('✅ Districts:', result.data);
//         // TODO: Bạn có thể lưu danh sách này vào state hoặc map với ward để suy ra
//       }
//     } catch (error) {
//       console.error('❌ Lỗi khi lấy district:', error);
//     }
//   };

//   fetchDistricts();
// }, [selectedProvince]);



// const extractDistrictFromMerged = (mergedFrom: string[] = []): string => {
//   if (!mergedFrom.length) return 'Không rõ';

//   const mergedText = mergedFrom.join(', ').toLowerCase();

//   // Regex bắt cụm từ "quận ABC", "huyện XYZ", ví dụ: "quận ba đình"
//   const match = mergedText.match(/(quận|huyện)\s+([a-zA-ZÀ-Ỵà-ỵ\s]+)/i);

//   if (!match) return 'Không rõ';

//   const type = capitalizeFirstLetter(match[1]); // quận hoặc huyện
//   const name = capitalizeWords(match[2].trim()); // ví dụ: ba đình → Ba Đình

//   return `${type} ${name}`;
// };

// const capitalizeFirstLetter = (str: string) =>
//   str.charAt(0).toUpperCase() + str.slice(1);

// const capitalizeWords = (str: string) =>
//   str.replace(/\b\w/g, (char) => char.toUpperCase());


//   const handleSubmitOrder = async () => {
//     try {
//       const products = cartItems.map((item) => ({
//         id_product_variant: item.productId,
//         quantity: item.quantity,
//         price: item.price * (1 - (item.sale || 0) / 100),
//       }));

//       const currentProvinceData = data.find((p) => p.province === selectedProvince);
//       const currentWardData = currentProvinceData?.wards.find((w) => w.name === selectedWard);
//       const inferredDistrict = extractDistrictFromMerged(currentWardData?.mergedFrom);

//       const payload = {
//       id_user: user?._id,
//       shipping_fee: shippingFee || 0, 
//       id_voucher: null,
//       paymentMethod: 'COD',
//       shipping_type: shippingType,
//       receiver_name: shippingInfo.name,
//       receiver_phone: shippingInfo.phone,
//       note: shippingInfo.note,

//       address: shippingInfo.address,
//       ward: selectedWard,
//       district: inferredDistrict, 
//       province: selectedProvince,

//       products,
//     };


//         const res = await fetch('/api/order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     const result = await res.json(); // ✅ đổi từ `data` → `result`

//     if (!result.success) return alert('Tạo đơn hàng thất bại.');

//     // dùng `result.order` thay vì `data.order` phía dưới
//     const resGHTK = await fetch('/api/ghtk/create-order', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         order: result.order,
//         orderDetails: cartItems.map((item) => ({
//           name: item.name,
//           quantity: item.quantity,
//         })),
//       }),
//     });

//           console.log("📦 Payload gửi GHTK:", {
//   order: result.order,
//   orderDetails: cartItems.map((item) => ({
//     name: item.name,
//     quantity: item.quantity,
//   })),
// });

//       const ghtk = await resGHTK.json();
//       if (ghtk.success) alert('Đặt hàng và tạo đơn GHTK thành công!');
//       else alert('Đặt hàng thành công, nhưng tạo đơn GHTK thất bại.');
//     } catch (err) {
//       console.error('Lỗi khi gửi đơn hàng:', err);
//       alert('Đã có lỗi xảy ra.');
//     }
//   };

const handleSubmitOrder = async () => {
  try {
    const products = cartItems.map((item) => ({
      id_product_variant: item.productId,
      quantity: item.quantity,
      price: item.price * (1 - (item.sale || 0) / 100),
    }));

    // const currentProvinceData = data.find((p) => p.province === selectedProvince);
    // const currentWardData = currentProvinceData?.wards.find((w) => w.name === selectedWard);
    // const inferredDistrict = extractDistrictFromMerged(currentWardData?.mergedFrom);

    const payload = {
      id_user: user?._id,
      shipping_fee: shippingFee || 0,
      id_voucher: null,
      paymentMethod: 'COD',
      shipping_type: shippingType,
      receiver_name: shippingInfo.name,
      receiver_phone: shippingInfo.phone,
      note: shippingInfo.note,
      address: shippingInfo.address,
      ward: selectedWard,
      // district: inferredDistrict,
      province: selectedProvince,
      products,
    };

    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!result.success) return alert('Tạo đơn hàng thất bại.');

    // ❌ Tạm thời không gửi lên GHTK
    alert("Đặt hàng thành công");
  } catch (err) {
    console.error('Lỗi khi gửi đơn hàng:', err);
    alert('Đã có lỗi xảy ra.');
  }
};


  return (
    <MaxWidthWrapper>
      <a href="/user">
        <div className="logo-pay">
          <Image
            src="/images/logo.png"
            alt="Aura Store"
            width={160}
            height={60}
            className="object-contain"
            priority
          />
        </div>
      </a>

      <div className="container-payment">
        <div className="left-column">
          <div className="container">
            <nav className="breadcrumb">
              <a href="/user">Trang chủ</a> / <a href="/user/cart">Giỏ hàng</a> /{' '}
              <span>Thông tin giao hàng</span>
            </nav>
            <h2>Thông tin giao hàng</h2>

            <CheckoutForm
              shippingInfo={shippingInfo}
              setShippingInfo={setShippingInfo}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              selectedWard={selectedWard}
              setSelectedWard={setSelectedWard}
              provinces={data}
              wards={wards}
            />
          </div>

          <ShippingMethods
            shippingType={shippingType}
            setShippingType={setShippingType}
            shippingFeeRoad={shippingFeeRoad}
            shippingFeeFly={shippingFeeFly}
          />

          <PaymentMethods onSubmit={handleSubmitOrder} />
        </div>

        <div className="right-column">
          <OrderSummary
            shippingFee={shippingFee}
            shippingType={shippingType}
            finalTotal={finalTotal}
            totalPrice={totalPrice}
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
