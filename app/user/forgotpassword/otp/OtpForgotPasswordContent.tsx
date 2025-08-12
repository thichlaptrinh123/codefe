'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OtpForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phoneParam = searchParams.get('phone') || ''
  const [otp, setOtp] = useState('')
  const [phone] = useState(phoneParam)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!phone) {
      alert('Thiếu số điện thoại. Vui lòng quay lại bước phục hồi.')
      router.push('/user/forgotpassword')
    }
  }, [phone, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      alert('Vui lòng nhập mã OTP')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otp.trim() }),
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
          </Link>{' '}
          / <span>Phục hồi mật khẩu / OTP</span>
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
            value={phone}
            readOnly
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 border-gray-300"
          />

          <input
            type="text"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
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
            {loading ? 'Đang xác thực...' : 'Xác thực mã OTP'}
          </button>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href="/user/forgotpassword"
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
