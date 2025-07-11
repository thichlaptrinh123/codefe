'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../css_user/forgotpassword.css' // Đường dẫn tới file CSS của bạn
import MaxWidthWrapper from '../components/maxWidthWrapper'
import React from 'react'
import  LINK  from 'next/link' // Import the LINK component for navigation

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Gửi yêu cầu gửi mã OTP về server với số điện thoại
    console.log('Gửi mã đến:', phone)

    // Sau khi gửi thành công
    router.push('/user/forgotpassword/otp')
  }

  return (
    <main>
      <div className="breadcrumb-forgotpassword">
              <MaxWidthWrapper>
                <LINK href="/">Trang chủ</LINK> / <span>Phục hồi mật khẩu </span>
              </MaxWidthWrapper>
            </div>
      <div className="form-wrapper-forgotpassword">
        <form className="reset-form-forgotpassword" onSubmit={handleSubmit}>
          <h2 className="title-forgotpassword">Phục hồi mật khẩu</h2>
          <input
            type="text"
            className="input-forgotpassword"
            placeholder=" Số điện thoại "
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
