"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  useEffect(() => {
    const token = localStorage.getItem('shipper_token')
    router.push(token ? '/orders' : '/login')
  }, [router])
  return null
}