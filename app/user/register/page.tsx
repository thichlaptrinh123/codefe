'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../css_user/register.css'    // đường dẫn CSS bạn có sẵn
import MaxWidthWrapper from '../components/maxWidthWrapper'
import LINK from 'next/link' // Import LINK from next/link

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Gửi API OTP nếu cần
    router.push('/user/register/otp') // điều hướng sang trang register2
  }

  return (
    <main>
          <div className="breadcrumb-register">
     <MaxWidthWrapper>
    <LINK href="#">Trang chủ</LINK> / <span>Bộ sưu tập</span>
    </MaxWidthWrapper>
  </div>
      <div className="container-register">
        <h2 className="title-register">Tạo tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            name="phone"
            className="input-register"
            placeholder="Nhập số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="confirm-btn-register">
            Gửi mã xác nhận
          </button>
        </form>
        <div className="divider-register" />
        <LINK href="/user/login" className="back-link-register">
          <span className="arrow-left-register">←</span> Quay về
        </LINK>
      </div>
    </main>
  )
}
