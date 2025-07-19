'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../../css_user/register.css' // nếu đang dùng chung style

export default function OtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: xử lý xác minh OTP ở đây nếu cần
    router.push('/user/register/password') // điều hướng sang bước 3
  }

  return (
    <main>
      <div className="container-register">
        <h2 className="title-register">Tạo tài khoản</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            name="phone"
            className="input-register"
            defaultValue="0353525020"
            readOnly
          />
          <input
            type="text"
            name="otp"
            className="input-register"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="confirm-btn-register">
            Xác thực mã OTP
          </button>
        </form>
        <div className="divider-register" />
        <Link href="/user/register" className="back-link-register">
          <span className="arrow-left-register">←</span> Quay về
        </Link>
      </div>
    </main>
  )
}
