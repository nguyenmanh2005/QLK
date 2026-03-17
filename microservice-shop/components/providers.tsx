"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Toaster } from 'sonner'

// ==================== TYPES ====================
interface User {
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

interface CartItem extends Product {
  quantity: number
}

interface Order {
  id: number
  userId: number
  productId: number
  quantity: number
  totalPrice: number
  status: string
  createdAt: string
  product?: Product
}

interface Review {
  id: number
  productId: number
  userId: number
  userName: string
  orderId: number
  title: string
  comment: string
  rating: number
  imageUrl?: string
  createdAt: string
}

// ==================== AUTH CONTEXT ====================
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isAuth: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ==================== CART CONTEXT ====================
interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  updateQty: (productId: number, quantity: number) => void
  removeFromCart: (productId: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

// ==================== API CONFIG ====================
const API_CONFIG = {
  USER_URL:    'http://localhost:5268/api',
  PRODUCT_URL: 'http://localhost:5159/api',
  ORDER_URL:   'http://localhost:5291/api',
}

export const PRODUCT_BASE_URL = 'http://localhost:5159'

async function apiRequest(baseUrl: string, endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('shop_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  }

  const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers })

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('shop_token')
      localStorage.removeItem('shop_user')
      window.location.href = '/login'
    }
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || 'Request failed')
  }

  return response.json()
}

// ==================== API SERVICES ====================
export const authService = {
  login: (data: { email: string; password: string }) =>
    apiRequest(API_CONFIG.USER_URL, '/users/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest(API_CONFIG.USER_URL, '/users', { method: 'POST', body: JSON.stringify(data) }),
}

export const userService = {
  getById: (id: number) =>
    apiRequest(API_CONFIG.USER_URL, `/users/${id}`),
}

export const productService = {
  getAll:  ()           => apiRequest(API_CONFIG.PRODUCT_URL, '/products'),
  getById: (id: number) => apiRequest(API_CONFIG.PRODUCT_URL, `/products/${id}`),
  getBySeller: (sellerId: number) =>
    apiRequest(API_CONFIG.PRODUCT_URL, `/products/seller/${sellerId}`),
}

export const orderService = {
  create: (data: { userId: number; productId: number; quantity: number }) =>
    apiRequest(API_CONFIG.ORDER_URL, '/orders', { method: 'POST', body: JSON.stringify(data) }),
  getByUser: (userId: string) =>
    apiRequest(API_CONFIG.ORDER_URL, `/orders/user/${userId}`),
  cancel: (orderId: number) =>
    apiRequest(API_CONFIG.ORDER_URL, `/orders/${orderId}/cancel`, { method: 'PATCH' }),
}

export const reviewService = {
  getByProduct: (productId: number) =>
    apiRequest(API_CONFIG.PRODUCT_URL, `/reviews/product/${productId}`),
  hasReviewed: (orderId: number) =>
    apiRequest(API_CONFIG.PRODUCT_URL, `/reviews/check/${orderId}`),
  create: (data: {
    productId: number
    userId: number
    userName: string
    orderId: number
    title: string
    comment: string
    rating: number
    imageUrl?: string
  }) => apiRequest(API_CONFIG.PRODUCT_URL, '/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('shop_token') : null
    const form  = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_CONFIG.PRODUCT_URL}/reviews/upload-image`, {
      method:  'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body:    form,
    })
    if (!res.ok) throw new Error('Upload ảnh thất bại')
    return res.json()
  },
}

// ==================== AUTH PROVIDER ====================
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('shop_user')
    if (savedUser) setUser(JSON.parse(savedUser))
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password })
    const { token } = data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userData: User = {
      id:    payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name:  payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
    }
    localStorage.setItem('shop_token', token)
    localStorage.setItem('shop_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const register = async (name: string, email: string, password: string) => {
    await authService.register({ name, email, password })
  }

  const logout = () => {
    localStorage.removeItem('shop_token')
    localStorage.removeItem('shop_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

// ==================== CART PROVIDER ====================
function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems]   = useState<CartItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('shop_user')
      const newId = savedUser ? JSON.parse(savedUser).id : null
      setUserId(newId)
    }
    syncUser()
    window.addEventListener('storage', syncUser)
    return () => window.removeEventListener('storage', syncUser)
  }, [])

  useEffect(() => {
    if (!userId) { setItems([]); return }
    try {
      const saved = localStorage.getItem(`shop_cart_${userId}`)
      setItems(saved ? JSON.parse(saved) : [])
    } catch { setItems([]) }
  }, [userId])

  useEffect(() => {
    if (!userId) return
    localStorage.setItem(`shop_cart_${userId}`, JSON.stringify(items))
  }, [items, userId])

  const addToCart = (product: Product, quantity = 1) => {
    if (!userId) { window.location.href = '/login'; return }
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const updateQty = (productId: number, quantity: number) => {
    if (quantity < 1) { removeFromCart(productId); return }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
  }

  const removeFromCart = (productId: number) =>
    setItems(prev => prev.filter(i => i.id !== productId))

  const clearCart = () => {
    setItems([])
    if (userId) localStorage.removeItem(`shop_cart_${userId}`)
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

// ==================== HOOKS ====================
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
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

// ==================== MAIN PROVIDER ====================
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--card-foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
}

// ==================== TYPES EXPORT ====================
export type { User, Product, CartItem, Order, Review }