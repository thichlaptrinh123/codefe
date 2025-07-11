'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import '../../css_user/forgotpassword.css' // Đường dẫn tới file CSS của bạn
import React from 'react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }

    // TODO: Gửi mật khẩu mới lên server
    console.log('Mật khẩu mới:', password)

    // Xong thì chuyển sang trang login
    router.push('/user/login')
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

          <button type="submit" className="button-forgotpassword">
            Lưu
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
