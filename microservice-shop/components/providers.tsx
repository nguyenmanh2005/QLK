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

export interface Product {
  id: number
  name: string
  description?: string
  price: number
  stock: number
  imageUrl?: string
  sellerId?: number
}

export interface CartItem {
  productId: string
  sellerId: string
  sellerName: string
  name: string
  price: number
  imageUrl?: string
  stock: number
  quantity: number
  subtotal: number
}

export interface SellerGroup {
  sellerId: string
  sellerName: string
  items: CartItem[]
  subTotal: number
}

interface Order {
  id: number
  userId: number
  productId: number
  quantity: number
  totalPrice: number
  productName?: string
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

// ==================== API CONFIG ====================
const API_CONFIG = {
  USER_URL:    'http://localhost:5268/api',
  PRODUCT_URL: 'http://localhost:5159/api',
  ORDER_URL:   'http://localhost:5291/api',
  CART_URL:    'http://localhost:5000/gateway/cart', // qua API Gateway
}

export const PRODUCT_BASE_URL = 'http://localhost:5159'

function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('shop_token')
}

async function apiRequest(url: string, options?: RequestInit, redirectOn401 = true) {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    // Chỉ redirect khi gọi UserService — không redirect khi CartService trả 401
    if (response.status === 401 && redirectOn401 && typeof window !== 'undefined') {
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
    apiRequest(`${API_CONFIG.USER_URL}/users/login`, { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest(`${API_CONFIG.USER_URL}/users`, { method: 'POST', body: JSON.stringify(data) }),
}

export const userService = {
  getById: (id: number) => apiRequest(`${API_CONFIG.USER_URL}/users/${id}`),
}

export const productService = {
  getAll:      ()              => apiRequest(`${API_CONFIG.PRODUCT_URL}/products`),
  getById:     (id: number)    => apiRequest(`${API_CONFIG.PRODUCT_URL}/products/${id}`),
  getBySeller: (sellerId: number) => apiRequest(`${API_CONFIG.PRODUCT_URL}/products/seller/${sellerId}`),
}

export const orderService = {
  create: (data: { userId: number; productId: number; quantity: number }) =>
    apiRequest(`${API_CONFIG.ORDER_URL}/orders`, { method: 'POST', body: JSON.stringify(data) }),
  getByUser: (userId: string) =>
    apiRequest(`${API_CONFIG.ORDER_URL}/orders/user/${userId}`),
  cancel: (orderId: number) =>
    apiRequest(`${API_CONFIG.ORDER_URL}/orders/${orderId}/cancel`, { method: 'PATCH' }),
}

export const reviewService = {
  getByProduct: (productId: number) =>
    apiRequest(`${API_CONFIG.PRODUCT_URL}/reviews/product/${productId}`),
  hasReviewed: (orderId: number) =>
    apiRequest(`${API_CONFIG.PRODUCT_URL}/reviews/check/${orderId}`),
  create: (data: {
    productId: number; userId: number; userName: string; orderId: number
    title: string; comment: string; rating: number; imageUrl?: string
  }) => apiRequest(`${API_CONFIG.PRODUCT_URL}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  uploadImage: async (file: File): Promise<{ imageUrl: string }> => {
    const token = getToken()
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_CONFIG.PRODUCT_URL}/reviews/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) throw new Error('Upload ảnh thất bại')
    return res.json()
  },
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
  sellerGroups: SellerGroup[]
  totalItems: number
  totalPrice: number
  loading: boolean
  addToCart: (product: Product, quantity?: number) => Promise<void>
  updateQty: (productId: string, quantity: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}
const CartContext = createContext<CartContextType | null>(null)

// ==================== AUTH PROVIDER ====================
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // bắt đầu true, chờ đọc localStorage

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('shop_user')
      if (savedUser) setUser(JSON.parse(savedUser))
    } catch {
      localStorage.removeItem('shop_user')
    } finally {
      setLoading(false) // chỉ false sau khi đọc xong
    }
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
const emptyCart = { items: [], sellerGroups: [], totalPrice: 0, totalItems: 0 }

function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]       = useState(emptyCart)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!getToken()) return
    try {
      setLoading(true)
      const data = await apiRequest(`${API_CONFIG.CART_URL}`, undefined, false)
      setCart(data)
    } catch {
      // CartService chưa chạy hoặc lỗi — giữ cart trống, không crash app
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (product: Product, quantity = 1) => {
    if (!getToken()) { window.location.href = '/login'; return }
    await apiRequest(`${API_CONFIG.CART_URL}/add`, {
      method: 'POST',
      body: JSON.stringify({
        productId: String(product.id),
        sellerId:  String(product.sellerId ?? ''),
        quantity,
      }),
    }, false)
    await refreshCart()
  }

  const updateQty = async (productId: string, quantity: number) => {
    await apiRequest(`${API_CONFIG.CART_URL}/item/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }, false)
    await refreshCart()
  }

  const removeFromCart = async (productId: string) => {
    await apiRequest(`${API_CONFIG.CART_URL}/item/${productId}`, { method: 'DELETE' }, false)
    await refreshCart()
  }

  const clearCart = async () => {
    await apiRequest(`${API_CONFIG.CART_URL}`, { method: 'DELETE' }, false)
    setCart(emptyCart)
  }

  return (
    <CartContext.Provider value={{
      items:        cart.items,
      sellerGroups: cart.sellerGroups,
      totalItems:   cart.totalItems,
      totalPrice:   cart.totalPrice,
      loading,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

// ==================== HOOKS ====================
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function useRequireAuth() {
  const { isAuth, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    // Chờ loading xong hẳn mới check — tránh redirect sớm khi chưa đọc xong localStorage
    if (loading) return
    if (!isAuth) router.push('/login')
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
export type { User, Order, Review }