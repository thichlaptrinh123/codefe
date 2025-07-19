'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import  LINK  from 'next/link' 
import '../../css_user/forgotpassword.css' // Đường dẫn tới file CSS của bạn    
import MaxWidthWrapper from '../../components/maxWidthWrapper'

export default function OtpForgotPasswordPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const phone = '0353525020' // Trong thực tế, nên lấy từ state / context / params

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // TODO: Gửi OTP lên server để xác thực
    console.log('Xác thực OTP:', otp)

    // Nếu đúng -> chuyển trang nhập mật khẩu mới
    router.push('/user/forgotpassword/reset')
  }

  return (
    <main>
      <div className="breadcrumb-forgotpassword">
        <MaxWidthWrapper>
          <LINK href="/">Trang chủ</LINK> / <span>Phục hồi mật khẩu / OTP</span>
        </MaxWidthWrapper>
      </div>
      <div className="form-wrapper-forgotpassword">
        <form className="reset-form-forgotpassword" onSubmit={handleSubmit}>
          <h2 className="title-forgotpassword">Phục hồi mật khẩu</h2>

          <input
            type="text"
            className="input-forgotpassword"
            value={phone}
            readOnly
          />

          <input
            type="text"
            className="input-forgotpassword"
            placeholder="Nhập mã OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button type="submit" className="button-forgotpassword">
            Xác thực mã OTP
          </button>

          <div className="divider-forgotpassword" />
          
          <div className="back-link-forgotpassword">
            <LINK href="/user/forgotpassword" style={{ textDecoration: 'none' }}>
              ← Quay về
            </LINK>
          </div>
        </form>
      </div>
    </main>
  )
}
