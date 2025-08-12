import { Suspense } from 'react'
import ResetPasswordPage from './ResetPasswordPage'

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ResetPasswordPage />
    </Suspense>
  )
}
