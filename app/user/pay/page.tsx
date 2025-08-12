'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '@/public/styles/pay.css';
import MaxWidthWrapper from '@/components/shared/MaxWidthWrapper';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import CheckoutForm from '../components/checkout/CheckoutForm';
import ShippingMethods from '../components/checkout/ShippingMethods';
import PaymentMethods from '../components/checkout/PaymentMethods';
import OrderSummary from '../components/checkout/OrderSummary';
import { useRouter } from 'next/navigation';

interface Ward {
  name: string;
  mergedFrom: string[];
}

interface ProvinceData {
  province: string;
  wards: Ward[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.items);

  // Lấy đơn hàng mua ngay (1 sản phẩm) từ localStorage
  const [buyNowOrder, setBuyNowOrder] = useState<{ items: typeof cartItems } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const order = localStorage.getItem('buyNowOrder');
      if (order) {
        try {
          setBuyNowOrder(JSON.parse(order));
        } catch (e) {
          console.error('Lỗi parse buyNowOrder:', e);
        }
      }
    }
  }, []);

  // Dùng đơn hàng mua ngay nếu có, nếu không thì dùng giỏ hàng bình thường
  const activeItems = buyNowOrder?.items && buyNowOrder.items.length > 0 ? buyNowOrder.items : cartItems;

  const totalPrice = useMemo(() => {
    return activeItems.reduce(
      (acc, item) => acc + item.quantity * item.price * (1 - (item.sale || 0) / 100),
      0
    );
  }, [activeItems]);

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

  const clearCart = useCartStore((state) => state.clearCart);

  // 👉 Lấy user từ localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.phone?.startsWith('+84')) {
          parsedUser.phone = '0' + parsedUser.phone.slice(3);
        }
        setUser(parsedUser);
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

  const handleSubmitOrder = async () => {
    const normalize = (str: string) => str?.trim()?.replace(/\s+/g, ' ') || '';

    // VALIDATE INPUT
    if (!normalize(shippingInfo.name)) {
      alert('Vui lòng nhập họ và tên');
      return;
    }

    if (!normalize(shippingInfo.phone) || !/^0\d{9}$/.test(shippingInfo.phone)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10 số, bắt đầu bằng 0)');
      return;
    }

    if (!normalize(shippingInfo.address)) {
      alert('Vui lòng nhập địa chỉ cụ thể');
      return;
    }

    if (!normalize(selectedProvince)) {
      alert('Vui lòng chọn tỉnh / thành phố');
      return;
    }

    if (!normalize(selectedWard)) {
      alert('Vui lòng chọn phường / xã');
      return;
    }

    try {
      // Dùng activeItems thay vì cartItems
      const products = activeItems.map((item) => ({
        id_product_variant: item.productId,
        quantity: item.quantity,
        price: item.price * (1 - (item.sale || 0) / 100),
      }));

      const fullAddress = `${normalize(shippingInfo.address)}, ${normalize(selectedWard)}, ${normalize(selectedProvince)}`;

     const payload = {
      id_user: user?.id || user?._id || null,
      shipping_fee: shippingFee || 0,
      id_voucher: null,
      paymentMethod: 'COD',
      shipping_type: shippingType,
      receiver_name: shippingInfo.name,
      receiver_phone: shippingInfo.phone,
      note: shippingInfo.note,
      address: fullAddress,
      products,
    };

      console.log('Submitting order:', payload);

      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        return alert('Tạo đơn hàng thất bại.');
      }
      alert('Đặt hàng thành công');

      // Xử lý sau khi thanh toán thành công:
      if (buyNowOrder) {
        localStorage.removeItem('buyNowOrder'); // xóa đơn mua ngay
      } else {
        clearCart(); // xóa giỏ hàng
      }

      router.push('/user/account');
    } catch (err) {
      console.error('Lỗi khi gửi đơn hàng:', err);
      alert('Đã có lỗi xảy ra.');
    }
  };


  useEffect(() => {
  const handleUnload = () => {
    if (buyNowOrder) {
      localStorage.removeItem('buyNowOrder');
    }
  };

  window.addEventListener('beforeunload', handleUnload);

  return () => {
    window.removeEventListener('beforeunload', handleUnload);
  };
}, [buyNowOrder]);


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
              <a href="/">Trang chủ</a> / <a href="/user/cart">Giỏ hàng</a> /{' '}
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
              userData={{
                name: user?.username || '',
                phone: user?.phone || '',
                address: user?.address || '', // Nếu bạn có lưu địa chỉ user
              }}
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
            items={activeItems} 
          />
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
