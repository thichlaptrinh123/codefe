import { Suspense } from 'react'
import OtpForgotPasswordPage from './OtpForgotPasswordContent'

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <OtpForgotPasswordPage />
    </Suspense>
  )
}
