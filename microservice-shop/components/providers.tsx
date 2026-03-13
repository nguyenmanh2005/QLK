"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
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
  USER_URL: 'https://localhost:7296/api',
  PRODUCT_URL: 'https://localhost:7084/api',
  ORDER_URL: 'https://localhost:7062/api',
}

async function apiRequest(baseUrl: string, endpoint: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('shop_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options?.headers || {}),
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  })
  
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

export const productService = {
  getAll: () => apiRequest(API_CONFIG.PRODUCT_URL, '/products'),
  getById: (id: number) => apiRequest(API_CONFIG.PRODUCT_URL, `/products/${id}`),
}

export const orderService = {
  create: (data: { userId: number; productId: number; quantity: number }) => 
    apiRequest(API_CONFIG.ORDER_URL, '/orders', { method: 'POST', body: JSON.stringify(data) }),
  getByUser: (userId: string) => apiRequest(API_CONFIG.ORDER_URL, `/orders/user/${userId}`),
}

// ==================== PROVIDERS ====================
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('shop_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password })
    const { token } = data
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userData: User = {
      id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
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

function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shop_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: Product, quantity = 1) => {
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
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i))
  }

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(i => i.id !== productId))
  }

  const clearCart = () => setItems([])

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
export type { User, Product, CartItem, Order }
