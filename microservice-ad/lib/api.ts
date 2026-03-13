// Mock data for demo
export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  imageUrl: string | null
}

export interface Order {
  id: number
  userId: number
  productId: number
  quantity: number
  totalPrice: number
  status: "Pending" | "Confirmed" | "Cancelled"
  createdAt: string
  user?: User
  product?: Product
}

// Demo data
let users: User[] = [
  { id: 1, name: "Nguyen Van A", email: "a@example.com", createdAt: "2024-01-15" },
  { id: 2, name: "Tran Thi B", email: "b@example.com", createdAt: "2024-01-20" },
  { id: 3, name: "Le Van C", email: "c@example.com", createdAt: "2024-02-01" },
  { id: 4, name: "Pham Thi D", email: "d@example.com", createdAt: "2024-02-10" },
]

let products: Product[] = [
  { id: 1, name: "iPhone 15 Pro", description: "Smartphone cao cap", price: 29990000, stock: 50, imageUrl: null },
  { id: 2, name: "MacBook Pro M3", description: "Laptop manh me", price: 52990000, stock: 25, imageUrl: null },
  { id: 3, name: "AirPods Pro", description: "Tai nghe khong day", price: 6990000, stock: 100, imageUrl: null },
  { id: 4, name: "iPad Air", description: "May tinh bang", price: 18990000, stock: 35, imageUrl: null },
]

let orders: Order[] = [
  { id: 1, userId: 1, productId: 1, quantity: 1, totalPrice: 29990000, status: "Confirmed", createdAt: "2024-03-01" },
  { id: 2, userId: 2, productId: 2, quantity: 1, totalPrice: 52990000, status: "Pending", createdAt: "2024-03-05" },
  { id: 3, userId: 3, productId: 3, quantity: 2, totalPrice: 13980000, status: "Cancelled", createdAt: "2024-03-08" },
  { id: 4, userId: 1, productId: 4, quantity: 1, totalPrice: 18990000, status: "Pending", createdAt: "2024-03-10" },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// User Service
export const userService = {
  getAll: async (): Promise<User[]> => {
    await delay(300)
    return users
  },
  create: async (data: Omit<User, "id" | "createdAt">): Promise<User> => {
    await delay(300)
    const newUser: User = {
      ...data,
      id: Math.max(...users.map((u) => u.id), 0) + 1,
      createdAt: new Date().toISOString().split("T")[0],
    }
    users.push(newUser)
    return newUser
  },
  update: async (id: number, data: Partial<User>): Promise<User> => {
    await delay(300)
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error("User not found")
    users[index] = { ...users[index], ...data }
    return users[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    users = users.filter((u) => u.id !== id)
  },
}

// Product Service
export const productService = {
  getAll: async (): Promise<Product[]> => {
    await delay(300)
    return products
  },
  create: async (data: Omit<Product, "id">): Promise<Product> => {
    await delay(300)
    const newProduct: Product = {
      ...data,
      id: Math.max(...products.map((p) => p.id), 0) + 1,
    }
    products.push(newProduct)
    return newProduct
  },
  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    await delay(300)
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) throw new Error("Product not found")
    products[index] = { ...products[index], ...data }
    return products[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    products = products.filter((p) => p.id !== id)
  },
}

// Order Service
export const orderService = {
  getAll: async (): Promise<Order[]> => {
    await delay(300)
    return orders.map((o) => ({
      ...o,
      user: users.find((u) => u.id === o.userId),
      product: products.find((p) => p.id === o.productId),
    }))
  },
  create: async (data: { userId: number; productId: number; quantity: number }): Promise<Order> => {
    await delay(300)
    const product = products.find((p) => p.id === data.productId)
    if (!product) throw new Error("Product not found")
    const newOrder: Order = {
      id: Math.max(...orders.map((o) => o.id), 0) + 1,
      ...data,
      totalPrice: product.price * data.quantity,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
    }
    orders.push(newOrder)
    return newOrder
  },
  updateStatus: async (id: number, status: Order["status"]): Promise<Order> => {
    await delay(300)
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) throw new Error("Order not found")
    orders[index].status = status
    return orders[index]
  },
  delete: async (id: number): Promise<void> => {
    await delay(300)
    orders = orders.filter((o) => o.id !== id)
  },
}
