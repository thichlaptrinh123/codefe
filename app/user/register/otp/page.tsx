'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../css_user/register.css'

export default function OtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  // Lấy số điện thoại từ query string
  useEffect(() => {
    const p = searchParams.get('phone')
    if (p) setPhone(p)
  }, [searchParams])

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
        alert('Xác minh OTP thành công')
        // Lưu số điện thoại vào localStorage để trang PasswordPage sử dụng
        localStorage.setItem('phone', phone)
        router.push('/user/register/password')
      } else {
        alert(data.error || 'OTP không hợp lệ')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi khi xác minh OTP')
    }
  }

  return (
    <main>
      <div className="container-register">
        <h2 className="title-register">Xác minh OTP</h2>
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
