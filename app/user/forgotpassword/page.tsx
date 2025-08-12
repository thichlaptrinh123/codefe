'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra định dạng số điện thoại
    if (!/^(0|\+84)\d{9}$/.test(phone)) {
      alert('Số điện thoại không hợp lệ!')
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
        alert('Mã OTP đã được gửi đến số điện thoại của bạn')
        router.push(`/user/forgotpassword/otp?phone=${encodeURIComponent(phone)}`)
      } else {
        alert(data.error || 'Không thể gửi mã OTP, vui lòng thử lại')
      }
    } catch (error) {
      console.error('Lỗi gửi OTP:', error)
      alert('Không thể kết nối server, vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-sm text-gray-600">
          <Link href="/" style={{ color: '#960130' }} className="hover:underline">
            Trang chủ
          </Link> / <span>Phục hồi mật khẩu</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 justify-center items-center px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center" style={{ color: '#960130' }}>
            Phục hồi mật khẩu
          </h2>

          <input
            type="text"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none border-gray-300"
            style={{ outlineColor: '#960130' }}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-2 rounded-lg transition disabled:opacity-50"
            style={{ backgroundColor: '#960130' }}
          >
            {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
          </button>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href="/user/login"
            style={{ color: '#960130' }}
            className="hover:underline flex justify-center text-sm"
          >
            ← Quay về
          </Link>
        </form>
      </div>
    </main>
  )
}
