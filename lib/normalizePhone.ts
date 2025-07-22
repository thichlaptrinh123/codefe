// Chuẩn hóa số điện thoại về dạng +84...
export function normalizePhone(phone: string): string {
    return phone.startsWith("+") ? phone : `+84${phone.replace(/^0/, "")}`;
  }
  