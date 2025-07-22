'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../css_user/register.css'
import MaxWidthWrapper from '../components/maxWidthWrapper'
import Link from 'next/link'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('OTP đã được gửi đến số điện thoại của bạn.')
        // Điều hướng sang trang OTP và truyền phone qua query
        router.push(`/user/register/otp?phone=${encodeURIComponent(phone)}`)
      } else {
        alert(data.error || 'Không gửi được OTP.')
      }
    } catch (error) {
      console.error(error)
      alert('Lỗi khi gửi OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <div className="breadcrumb-register">
        <MaxWidthWrapper>
          <Link href="/">Trang chủ</Link> / <span>Đăng ký</span>
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
          <button type="submit" className="confirm-btn-register" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
          </button>
        </form>
        <div className="divider-register" />
        <Link href="/user/login" className="back-link-register">
          <span className="arrow-left-register">←</span> Quay về đăng nhập
        </Link>
      </div>
    </main>
  )
}
