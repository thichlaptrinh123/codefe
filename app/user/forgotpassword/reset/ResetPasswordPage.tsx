'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import React from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!phone) {
      alert('Thiếu số điện thoại. Vui lòng thực hiện lại quy trình khôi phục.')
      router.push('/user/forgotpassword')
    }
  }, [phone, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      alert('Mật khẩu phải ít nhất 6 ký tự.')
      return
    }

    if (!/[a-zA-Z]/.test(password)) {
      alert('Mật khẩu phải chứa ít nhất một chữ cái.')
      return
    }

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, newPassword: password }),
      })

      const data = await res.json()

      if (res.ok) {
        alert('Đổi mật khẩu thành công!')
        router.push('/user/login')
      } else {
        alert(data.error || 'Đổi mật khẩu thất bại!')
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error)
      alert('Có lỗi xảy ra, vui lòng thử lại.')
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
          / <span>Đặt lại mật khẩu</span>
        </div>
      </div>

      {/* Form */}
      <div className="flex flex-1 justify-center items-center px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 space-y-4"
        >
          <h2 className="text-2xl font-bold text-center" style={{ color: '#960130' }}>
            Đặt lại mật khẩu
          </h2>

          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none border-gray-300"
            style={{ outlineColor: '#960130' }}
          />

          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
          </button>

          <div className="my-4 border-t border-gray-200"></div>

          <Link
            href={`/user/forgotpassword/otp?phone=${encodeURIComponent(phone)}`}
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
