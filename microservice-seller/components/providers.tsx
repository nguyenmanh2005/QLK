"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'sonner'

interface Seller {
  id: string
  name: string
  email: string
}

interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  sellerId?: number
}

interface Order {
  id: number
  userId: number
  productId: number
  productName?: string
  quantity: number
  totalPrice: number
  status: string
  shipperId?: number
  shipperName?: string
  createdAt: string
}

interface AuthContextType {
  seller: Seller | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuth: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const SELLER_API   = 'http://localhost:5183'
export const PRODUCT_BASE = 'http://localhost:5159'

const API = {
  SELLER:  'http://localhost:5183/api/seller',
  PRODUCT: 'http://localhost:5159/api',
  ORDER:   'http://localhost:5291/api',
}

async function apiRequest(url: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  }
  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('seller_token')
      localStorage.removeItem('seller_user')
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
    fetch(`${API.SELLER}/login`, {
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

export const productService = {
  getAll: () => apiRequest(`${API.SELLER}/products`),
  create: (data: Omit<Product, 'id'>) =>
    apiRequest(`${API.SELLER}/products`, { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Omit<Product, 'id'>) =>
    apiRequest(`${API.SELLER}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: number) =>
    apiRequest(`${API.SELLER}/products/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = typeof window !== 'undefined' ? localStorage.getItem('seller_token') : null
    const res = await fetch(`${PRODUCT_BASE}/api/products/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token ?? ''}` },
      body: formData,
    })
    if (!res.ok) throw new Error('Upload thất bại')
    return res.json()
  },
}

export const orderService = {
  getAll: () => apiRequest(`${API.SELLER}/orders`),
  updateStatus: (id: number, status: string) =>
    apiRequest(`${API.SELLER}/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [seller, setSeller]   = useState<Seller | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('seller_user')
    if (saved) setSeller(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password })
    const { token } = data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const sellerData: Seller = {
      id:    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name:  payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    }
    localStorage.setItem('seller_token', token)
    localStorage.setItem('seller_user', JSON.stringify(sellerData))
    setSeller(sellerData)
  }

  const logout = () => {
    localStorage.removeItem('seller_token')
    localStorage.removeItem('seller_user')
    setSeller(null)
  }

  return (
    <AuthContext.Provider value={{ seller, loading, login, logout, isAuth: !!seller }}>
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

export type { Seller, Product, Order }