'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#960130]">Trang chủ</Link> / <span>Đăng ký</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 justify-center items-center px-4">
        <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-center text-[#960130] mb-6">Tạo tài khoản</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="tel"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              pattern="[0-9]*"
              inputMode="numeric"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#960130] text-white py-2 rounded-lg hover:bg-[#7d0129] transition disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
            </button>
          </form>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href="/user/login"
            className="text-[#960130] hover:underline flex items-center justify-center gap-1 text-sm"
          >
            ← Quay về đăng nhập
          </Link>
        </div>
      </div>
    </main>
  )
}
