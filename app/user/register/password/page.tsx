'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PasswordPage() {
  const router = useRouter()
  const [fullname, setFullname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedPhone = localStorage.getItem('phone')
    if (savedPhone) {
      setPhone(savedPhone)
    } else {
      alert('Không tìm thấy số điện thoại, vui lòng quay lại đăng ký.')
      router.push('/user/register')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!fullname.trim()) {
      setError('Vui lòng nhập họ và tên.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: fullname,
          phone,
          password,
          confirmPassword,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        alert('Tạo tài khoản thành công!')
        localStorage.removeItem('phone')
        router.push('/user/login')
      } else {
        setError(data.message || 'Đăng ký thất bại!')
      }
    } catch (error) {
      console.error(error)
      setError('Có lỗi xảy ra, vui lòng thử lại.')
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

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullname"
              placeholder="Họ và tên"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu (≥ 6 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#960130] border-gray-300"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#960130] text-white py-2 rounded-lg hover:bg-[#7d0129] transition disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </form>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href="/user/register/otp"
            className="text-[#960130] hover:underline flex items-center justify-center gap-1 text-sm"
          >
            ← Quay về
          </Link>
        </div>
      </div>
    </main>
  )
}
