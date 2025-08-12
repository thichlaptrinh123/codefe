import { Suspense } from 'react'
import OtpPageClient from './OtpPageClient'

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <OtpPageClient />
    </Suspense>
  )
}
