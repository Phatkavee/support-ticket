'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to /dashboard instead of staying on the index
    router.replace('/dashboard')
  }, [router])

  return null
}
