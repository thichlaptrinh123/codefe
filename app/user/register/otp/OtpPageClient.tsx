'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OtpPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const p = searchParams.get('phone')
    if (p) setPhone(p)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Xác minh OTP thành công')
        localStorage.setItem('phone', phone)
        router.push('/user/register/password')
      } else {
        setError(data.error || 'OTP không hợp lệ')
      }
    } catch (err) {
      console.error(err)
      setError('Có lỗi khi xác minh OTP')
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
          <h2 className="text-2xl font-bold text-center text-[#960130] mb-6">Xác minh OTP</h2>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="tel"
              name="phone"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />
            <input
              type="text"
              name="otp"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#960130] text-white py-2 rounded-lg hover:bg-[#7d0129] transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Xác thực mã OTP'}
            </button>
          </form>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href="/user/register"
            className="text-[#960130] hover:underline flex items-center justify-center gap-1 text-sm"
          >
            ← Quay về
          </Link>
        </div>
      </div>
    </main>
  )
}
