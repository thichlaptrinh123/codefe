'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import '../css_user/register.css'
import MaxWidthWrapper from '../../components/maxWidthWrapper'
import Link from 'next/link'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Hàm kiểm tra số điện thoại (10 số, bắt đầu bằng 0)
  const validatePhone = (phone: string) => /^0\d{9}$/.test(phone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validatePhone(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0912345678).')
      return
    }

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
        router.push(`/user/register/otp?phone=${encodeURIComponent(phone)}`)
      } else {
        setError(data.error || 'Không gửi được OTP, vui lòng thử lại.')
      }
    } catch (err) {
      console.error('Lỗi gửi OTP:', err)
      setError('Lỗi kết nối đến server. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      {/* Breadcrumb */}
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
            pattern="[0-9]*"
            inputMode="numeric"
          />

          {/* Hiển thị lỗi */}
          {error && <p className="error-text" style={{ color: 'red', marginTop: '5px' }}>{error}</p>}

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
