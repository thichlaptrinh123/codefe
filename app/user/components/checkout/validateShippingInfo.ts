export const validateShippingInfo = ({
  name,
  phone,
  address,
  province,
  ward,
}: {
  name: string;
  phone: string;
  address: string;
  province: string;
  ward: string;
}) => {
  if (!name.trim()) {
    alert('Vui lòng nhập họ và tên');
    return false;
  }

  if (!phone.trim() || !/^0\d{9}$/.test(phone)) {
    alert('Số điện thoại không hợp lệ (phải 10 số và bắt đầu bằng 0)');
    return false;
  }

  if (!province || !ward) {
    alert('Vui lòng chọn tỉnh và phường/xã');
    return false;
  }

  if (!address.trim()) {
    alert('Vui lòng nhập địa chỉ cụ thể');
    return false;
  }

  return true;
};
