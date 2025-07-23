'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../css_user/forgotpassword.css'
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

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      alert('Mật khẩu phải ít nhất 6 ký tự.')
      return
    }

    // Kiểm tra mật khẩu phải có ít nhất một chữ cái
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
      const res = await fetch('/api/reset-password', {
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
    <main>
      <div className="breadcrumb-forgotpassword">
        Trang chủ / Tài khoản / Đặt lại mật khẩu
      </div>
      <div className="form-wrapper-forgotpassword">
        <form className="reset-form-forgotpassword" onSubmit={handleSubmit}>
          <h2 className="title-forgotpassword">Phục hồi mật khẩu</h2>

          <input
            type="password"
            className="input-forgotpassword"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            className="input-forgotpassword"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="button-forgotpassword" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>

          <div className="divider-forgotpassword" />
          <div className="back-link-forgotpassword">
            <Link href="/user/forgotpassword/otp" style={{ textDecoration: 'none' }}>
              ← Quay về
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}
