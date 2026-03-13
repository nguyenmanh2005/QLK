"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Loader2, ArrowRight, Clock, CheckCircle2, Truck, PackageCheck, XCircle, AlertCircle } from 'lucide-react'
import { orderService, useAuth, Providers, type Order } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const ORDER_STEPS = [
  { key: 'Pending', label: 'Chờ xử lý', icon: Clock },
  { key: 'Packing', label: 'Đóng gói', icon: Package },
  { key: 'Shipping', label: 'Đang giao', icon: Truck },
  { key: 'Delivered', label: 'Đã giao', icon: CheckCircle2 },
]

const STATUS_MESSAGES: Record<string, string> = {
  Pending: 'Đơn hàng đang chờ xác nhận từ cửa hàng',
  Packing: 'Cửa hàng đang đóng gói sản phẩm của bạn',
  Shipping: 'Đơn hàng đang trên đường giao đến bạn',
  Delivered: 'Đơn hàng đã giao thành công!',
}

function OrderTimeline({ status }: { status: string }) {
  if (status === 'Cancelled') {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-3">
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-medium text-destructive">Đơn hàng đã bị hủy</span>
      </div>
    )
  }

  const currentIdx = ORDER_STEPS.findIndex(s => s.key === status)

  return (
    <div className="mt-6">
      {/* Steps */}
      <div className="flex items-center">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= currentIdx
          const current = i === currentIdx
          const last = i === ORDER_STEPS.length - 1
          const Icon = step.icon

          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              {/* Circle */}
              <div className={cn(
                "relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                done 
                  ? "border-primary bg-primary text-primary-foreground" 
                  : "border-border bg-card text-muted-foreground",
                current && "ring-4 ring-primary/20"
              )}>
                {done ? (
                  current ? <Icon className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              {/* Connector line */}
              {!last && (
                <div className={cn(
                  "mx-2 h-0.5 flex-1 transition-colors",
                  i < currentIdx ? "bg-primary" : "bg-border"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="mt-3 flex justify-between">
        {ORDER_STEPS.map((step, i) => {
          const current = i === currentIdx
          const done = i < currentIdx
          return (
            <p key={step.key} className={cn(
              "text-xs text-center",
              current ? "font-semibold text-primary" : done ? "text-muted-foreground" : "text-muted-foreground/50"
            )} style={{ width: i === 0 || i === ORDER_STEPS.length - 1 ? 'auto' : undefined }}>
              {step.label}
            </p>
          )
        })}
      </div>

      {/* Status message */}
      {currentIdx >= 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
          {(() => {
            const Icon = ORDER_STEPS[currentIdx].icon
            return <Icon className="h-5 w-5 text-primary" />
          })()}
          <p className="text-sm font-medium">{STATUS_MESSAGES[status]}</p>
        </div>
      )}
    </div>
  )
}

function OrdersContent() {
  const { user, isAuth } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!isAuth || !user?.id) {
      setLoading(false)
      return
    }
    orderService.getByUser(user.id)
      .then(data => {
        const orderData = Array.isArray(data) ? data : data.data || []
        setOrders([...orderData].reverse())
      })
      .catch(() => toast.error('Không tải được đơn hàng!'))
      .finally(() => setLoading(false))
  }, [isAuth, user])

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 font-serif text-xl font-bold">Bạn cần đăng nhập</h1>
            <p className="mt-2 text-muted-foreground">
              Vui lòng đăng nhập để xem đơn hàng
            </p>
            <Link 
              href="/login" 
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Đăng nhập
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  const counts = {
    all: orders.length,
    Pending: orders.filter(o => o.status === 'Pending').length,
    Packing: orders.filter(o => o.status === 'Packing').length,
    Shipping: orders.filter(o => o.status === 'Shipping').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }

  const tabs = [
    { key: '', label: 'Tất cả', count: counts.all },
    { key: 'Pending', label: 'Chờ xử lý', count: counts.Pending },
    { key: 'Packing', label: 'Đóng gói', count: counts.Packing },
    { key: 'Shipping', label: 'Đang giao', count: counts.Shipping },
    { key: 'Delivered', label: 'Đã giao', count: counts.Delivered },
    { key: 'Cancelled', label: 'Đã hủy', count: counts.Cancelled },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold sm:text-3xl">Đơn hàng của tôi</h1>
            <p className="mt-1 text-muted-foreground">{orders.length} đơn hàng</p>
          </div>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            Tiếp tục mua sắm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                filter === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={cn(
                  "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs",
                  filter === tab.key ? "bg-primary-foreground/20" : "bg-background"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Đang tải đơn hàng...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-medium">Chưa có đơn hàng nào</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Hãy mua sắm để tạo đơn hàng đầu tiên!
            </p>
            <Link 
              href="/" 
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Mua ngay
            </Link>
          </div>
        )}

        {/* Order List */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 space-y-4">
            {filtered.map((order) => (
              <article key={order.id} className="rounded-xl border border-border bg-card p-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold">Đơn #{order.id}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className="text-lg font-bold">
                    {parseFloat(String(order.totalPrice)).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Product */}
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-card border border-border">
                    {order.product?.imageUrl ? (
                      <img
                        src={order.product.imageUrl.startsWith('/')
                          ? `https://localhost:7084${order.product.imageUrl}`
                          : order.product.imageUrl}
                        alt={order.product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{order.product?.name || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Số lượng: {order.quantity}</p>
                  </div>
                </div>

                {/* Timeline */}
                <OrderTimeline status={order.status} />
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Providers>
      <OrdersContent />
    </Providers>
  )
}
