"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// đây là trang gốc, nó sẽ tự động chuyển hướng đến dashboard nếu đã đăng nhập, hoặc đến login nếu chưa đăng nhập
export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('seller_token')
    router.push(token ? '/dashboard' : '/login')
  }, [router])
  return null
}