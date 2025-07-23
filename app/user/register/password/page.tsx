'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import '../../css_user/register.css'

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
    <main>
      <div className="container-register">
        <h2 className="title-register">Tạo tài khoản</h2>
        {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullname"
            className="input-register"
            placeholder="Họ và tên"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            className="input-register"
            placeholder="Mật khẩu (≥ 6 ký tự)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            name="confirmPassword"
            className="input-register"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="confirm-btn-register"
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </form>
        <div className="divider-register" />
        <Link href="/user/register/otp" className="back-link-register">
          <span className="arrow-left-register">←</span> Quay về
        </Link>
      </div>
    </main>
  )
}
