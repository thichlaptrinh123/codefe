'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../../css_user/forgotpassword.css'
import MaxWidthWrapper from '../../components/maxWidthWrapper'

export default function OtpForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') || ''  // lấy phone từ query (nếu có)
  const [otp, setOtp] = useState('')
  const [phone] = useState(phoneParam)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('OTP hợp lệ')
        router.push(`/user/forgotpassword/reset?phone=${phone}`)
      } else {
        alert(data.error || 'OTP không hợp lệ')
      }
    } catch (error) {
      console.error('Lỗi xác thực OTP:', error)
      alert('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <main>
      <div className="breadcrumb-forgotpassword">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Phục hồi mật khẩu / OTP</span>
        </MaxWidthWrapper>
      </div>
      <div className="form-wrapper-forgotpassword">
        <form className="reset-form-forgotpassword" onSubmit={handleSubmit}>
          <h2 className="title-forgotpassword">Phục hồi mật khẩu</h2>

          <input
            type="text"
            className="input-forgotpassword"
            value={phone}
            readOnly
          />

          <input
            type="text"
            className="input-forgotpassword"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit" className="button-forgotpassword">
            Xác thực mã OTP
          </button>

          <div className="divider-forgotpassword" />
          <div className="back-link-forgotpassword">
            <Link href="/user/forgotpassword" style={{ textDecoration: 'none' }}>
              ← Quay về
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
