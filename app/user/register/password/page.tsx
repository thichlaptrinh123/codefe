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

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }

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
        localStorage.removeItem('phone') // Xoá phone sau khi dùng
        router.push('/user/login')
      } else {
        alert(data.message || 'Đăng ký thất bại!')
      }
    } catch (error) {
      console.error(error)
      alert('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  return (
    <main>
      <div className="container-register">
        <h2 className="title-register">Tạo tài khoản</h2>
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
            placeholder="Mật khẩu"
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
          <button type="submit" className="confirm-btn-register">
            Lưu
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
