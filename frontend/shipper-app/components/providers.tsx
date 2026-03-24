"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'sonner'

interface Shipper {
  id: string
  name: string
  email: string
  phoneNumber?: string
}

export interface Order {
  id: number
  userId: number
  productId: number
  productName?: string
  quantity: number
  totalPrice: number
  status: string
  shipperId?: number
  createdAt: string
}

interface AuthContextType {
  shipper: Shipper | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuth: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API_BASE = 'http://localhost:5184/api/shipper'

async function apiRequest(url: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('shipper_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  }
  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('shipper_token')
      localStorage.removeItem('shipper_user')
      window.location.href = '/login'
      return
    }
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || 'Request failed')
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type')
  const text = await res.text()
  if (!text) return null
  if (contentType?.includes('application/json')) return JSON.parse(text)
  try { return JSON.parse(text) } catch { return text }
}

export const authService = {
  login: (data: { email: string; password: string }) =>
    fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async r => {
      if (!r.ok) {
        const err = await r.json().catch(() => ({ message: 'Đăng nhập thất bại' }))
        throw new Error(err.message || 'Đăng nhập thất bại')
      }
      return r.json()
    }),
}

export const shipperService = {
  getById: (id: string) => apiRequest(`${API_BASE}/${id}`),
  updateProfile: (data: { name: string; phoneNumber?: string }) => 
    apiRequest(`${API_BASE}/profile`, { method: 'PUT', body: JSON.stringify(data) }),
}

export const orderService = {
  getAvailable:     () => apiRequest(`${API_BASE}/orders/available`),
  getMyDelivering:  () => apiRequest(`${API_BASE}/orders/my-delivering`),
  getMyDelivered:   () => apiRequest(`${API_BASE}/orders/my-delivered`),
  assignOrder:      (id: number) =>
    apiRequest(`${API_BASE}/orders/${id}/assign`, { method: 'PATCH' }),
  confirmDelivered: (id: number) =>
    apiRequest(`${API_BASE}/orders/${id}/delivered`, { method: 'PUT' }),
  returnOrder:      (id: number) =>
    apiRequest(`${API_BASE}/orders/${id}/return`, { method: 'PUT' }),
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [shipper, setShipper] = useState<Shipper | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('shipper_user')
    if (saved) setShipper(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password })
    const { token } = data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const shipperData: Shipper = {
      id:    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name:  payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    }
    localStorage.setItem('shipper_token', token)
    localStorage.setItem('shipper_user', JSON.stringify(shipperData))
    setShipper(shipperData)
  }

  const logout = () => {
    localStorage.removeItem('shipper_token')
    localStorage.removeItem('shipper_user')
    setShipper(null)
  }

  return (
    <AuthContext.Provider value={{ shipper, loading, login, logout, isAuth: !!shipper }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useRequireAuth() {
  const { isAuth, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !isAuth) router.push('/login')
  }, [isAuth, loading, router])
  return { isAuth, loading }
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  )
}

export type { Shipper }