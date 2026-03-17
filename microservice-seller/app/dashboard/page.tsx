"use client"

import { useEffect, useState } from 'react'
import { Package, ShoppingBag, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useAuth, useRequireAuth, productService, orderService, Providers, type Order, type Product } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import Link from 'next/link'

function DashboardContent() {
  const { isAuth, loading } = useRequireAuth()
  const [products, setProducts]       = useState<Product[]>([])
  const [orders, setOrders]           = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!loading && isAuth) {
      setLoadingData(true)
      Promise.all([
        productService.getAll().catch(() => []),
        orderService.getAll().catch(() => []),
      ]).then(([p, o]) => {
        setProducts(Array.isArray(p) ? p : p?.data || [])
        setOrders(Array.isArray(o) ? o : o?.data || [])
      }).finally(() => setLoadingData(false))
    }
  }, [isAuth, loading])

  if (loading || loadingData) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const pendingOrders  = orders.filter(o => o.status === 'Pending').length
  const shippingOrders = orders.filter(o => o.status === 'Shipping').length
  const revenue        = orders.filter(o => o.status === 'Delivered')
                               .reduce((sum, o) => sum + Number(o.totalPrice), 0)

  const stats = [
    { label: 'Sản phẩm',  value: products.length,                       icon: Package,     color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Chờ xử lý', value: pendingOrders,                         icon: Clock,       color: 'bg-yellow-500/10 text-yellow-400' },
    { label: 'Đang giao',  value: shippingOrders,                        icon: ShoppingBag, color: 'bg-indigo-500/10 text-indigo-400' },
    { label: 'Doanh thu',  value: `${revenue.toLocaleString('vi-VN')}đ`, icon: TrendingUp,  color: 'bg-green-500/10 text-green-400' },
  ]

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Tổng quan cửa hàng của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Đơn hàng gần đây</h2>
          <Link href="/orders" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Xem tất cả <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Chưa có đơn hàng nào</p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">Đơn #{order.id}</p>
                  <p className="text-xs text-slate-400">{order.productName || `Product #${order.productId}`}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{Number(order.totalPrice).toLocaleString('vi-VN')}đ</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'Pending'   ? 'bg-yellow-500/10 text-yellow-400' :
                    order.status === 'Packing'   ? 'bg-blue-500/10 text-blue-400'    :
                    order.status === 'Shipping'  ? 'bg-indigo-500/10 text-indigo-400':
                    order.status === 'Delivered' ? 'bg-green-500/10 text-green-400'  :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <DashboardContent />
      </div>
    </Providers>
  )
}