'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../../css_user/register.css' // nếu đang dùng chung style

export default function PasswordPage() {
  const router = useRouter()
  const [fullname, setFullname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }

    // TODO: gửi dữ liệu lên server để tạo tài khoản
    console.log({ fullname, password })

    // Điều hướng sau khi tạo thành công
    router.push('/user/login') // hoặc trang chào mừng
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
