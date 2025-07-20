'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../css_user/forgotpassword.css'
import MaxWidthWrapper from '../components/maxWidthWrapper'
import React from 'react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Mã OTP đã được gửi đến số điện thoại của bạn')
        router.push(`/user/forgotpassword/otp?phone=${phone}`)
      } else {
        alert(data.error || 'Không thể gửi mã OTP, vui lòng thử lại')
      }
    } catch (error) {
      console.error('Lỗi gửi OTP:', error)
      alert('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  return (
    <main>
      <div className="breadcrumb-forgotpassword">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Phục hồi mật khẩu</span>
        </MaxWidthWrapper>
      </div>
      <div className="form-wrapper-forgotpassword">
        <form className="reset-form-forgotpassword" onSubmit={handleSubmit}>
          <h2 className="title-forgotpassword">Phục hồi mật khẩu</h2>
          <input
            type="text"
            className="input-forgotpassword"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="button-forgotpassword">
            Gửi mã xác nhận
          </button>
          <div className="divider-forgotpassword" />
          <div className="back-link-forgotpassword">
            <Link href="/user/login" style={{ textDecoration: 'none' }}>
              ← Quay về
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
