"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Package, Loader2, ArrowRight, Clock, CheckCircle2,
  Truck, XCircle, AlertCircle, Ban, Star,
} from 'lucide-react'
import { orderService, reviewService, useAuth, Providers, type Order, type Review } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { ReviewForm } from '@/components/review-form'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ==================== CONSTANTS ====================
const ORDER_STEPS = [
  { key: 'Pending',   label: 'Chờ xử lý', icon: Clock },
  { key: 'Packing',   label: 'Đóng gói',  icon: Package },
  { key: 'Shipping',  label: 'Đang giao', icon: Truck },
  { key: 'Delivered', label: 'Đã giao',   icon: CheckCircle2 },
]

const STATUS_MESSAGES: Record<string, string> = {
  Pending:   'Đơn hàng đang chờ xác nhận từ cửa hàng',
  Packing:   'Cửa hàng đang đóng gói sản phẩm của bạn',
  Shipping:  'Đơn hàng đang trên đường giao đến bạn',
  Delivered: 'Đơn hàng đã giao thành công!',
}

const CANCELLABLE = ['Pending', 'Packing']

// ==================== CANCEL BUTTON ====================
function CancelButton({ order, onCancelled }: { order: Order; onCancelled: (id: number) => void }) {
  const [loading, setLoading]         = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!CANCELLABLE.includes(order.status)) return null

  const handleCancel = async () => {
    setLoading(true)
    try {
      await orderService.cancel(order.id)
      toast.success(`Đã hủy đơn #${order.id}`)
      onCancelled(order.id)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Hủy đơn thất bại!')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
        <p className="flex-1 text-sm font-medium text-destructive">
          Bạn chắc chắn muốn hủy đơn này?
        </p>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors"
        >
          Không
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
          Xác nhận hủy
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => setShowConfirm(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" />
        Hủy đơn hàng
      </button>
    </div>
  )
}

// ==================== REVIEW SECTION ====================
function ReviewSection({ order }: { order: Order }) {
  const [checked, setChecked]       = useState(false)
  const [reviewed, setReviewed]     = useState(false)
  const [showForm, setShowForm]     = useState(false)
  const [doneReview, setDoneReview] = useState<Review | null>(null)

  useEffect(() => {
    if (order.status !== 'Delivered') return
    reviewService.hasReviewed(order.id)
      .then((res: { reviewed: boolean }) => {
        setReviewed(res.reviewed)
        setChecked(true)
      })
      .catch(() => setChecked(true))
  }, [order.id, order.status])

  if (order.status !== 'Delivered' || !checked) return null

  // Đã review
  if (reviewed || doneReview) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-medium text-amber-700">Bạn đã đánh giá đơn hàng này</span>
      </div>
    )
  }

  // Hiện form
  if (showForm && order.product) {
    return (
      <div className="mt-4">
        <ReviewForm
          productId={order.productId}
          productName={order.product.name}
          orderId={order.id}
          onSuccess={(review) => {
            setDoneReview(review)
            setShowForm(false)
          }}
        />
      </div>
    )
  }

  // Nút mở form
  return (
    <div className="mt-4 flex justify-end">
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/60 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
      >
        <Star className="h-3.5 w-3.5" />
        Đánh giá sản phẩm
      </button>
    </div>
  )
}

// ==================== ORDER TIMELINE ====================
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
      {/* Step circles */}
      <div className="flex items-center">
        {ORDER_STEPS.map((step, i) => {
          const done    = i <= currentIdx
          const current = i === currentIdx
          const last    = i === ORDER_STEPS.length - 1
          const Icon    = step.icon
          return (
            <div key={step.key} className="flex flex-1 items-center last:flex-none">
              <div className={cn(
                "relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all",
                done    ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground",
                current && "ring-4 ring-primary/20"
              )}>
                {done
                  ? (current ? <Icon className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />)
                  : <span className="text-xs font-medium">{i + 1}</span>
                }
              </div>
              {!last && (
                <div className={cn("mx-2 h-0.5 flex-1 transition-colors", i < currentIdx ? "bg-primary" : "bg-border")} />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="mt-3 flex justify-between">
        {ORDER_STEPS.map((step, i) => (
          <p key={step.key} className={cn(
            "text-xs text-center",
            i === currentIdx ? "font-semibold text-primary"
            : i < currentIdx ? "text-muted-foreground"
            : "text-muted-foreground/50"
          )}>
            {step.label}
          </p>
        ))}
      </div>

      {/* Status message */}
      {currentIdx >= 0 && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
          {(() => { const Icon = ORDER_STEPS[currentIdx].icon; return <Icon className="h-5 w-5 text-primary" /> })()}
          <p className="text-sm font-medium">{STATUS_MESSAGES[status]}</p>
        </div>
      )}
    </div>
  )
}

// ==================== MAIN PAGE ====================
function OrdersContent() {
  const { user, isAuth }      = useAuth()
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('')

  useEffect(() => {
    if (!isAuth || !user?.id) { setLoading(false); return }
    orderService.getByUser(user.id)
      .then(data => {
        const orderData = Array.isArray(data) ? data : data.data || []
        setOrders([...orderData].reverse())
      })
      .catch(() => toast.error('Không tải được đơn hàng!'))
      .finally(() => setLoading(false))
  }, [isAuth, user])

  const handleOrderCancelled = (orderId: number) =>
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o))

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
            <p className="mt-2 text-muted-foreground">Vui lòng đăng nhập để xem đơn hàng</p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
              Đăng nhập
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  const counts = {
    all:       orders.length,
    Pending:   orders.filter(o => o.status === 'Pending').length,
    Packing:   orders.filter(o => o.status === 'Packing').length,
    Shipping:  orders.filter(o => o.status === 'Shipping').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
    Cancelled: orders.filter(o => o.status === 'Cancelled').length,
  }

  const tabs = [
    { key: '',          label: 'Tất cả',    count: counts.all },
    { key: 'Pending',   label: 'Chờ xử lý', count: counts.Pending },
    { key: 'Packing',   label: 'Đóng gói',  count: counts.Packing },
    { key: 'Shipping',  label: 'Đang giao', count: counts.Shipping },
    { key: 'Delivered', label: 'Đã giao',   count: counts.Delivered },
    { key: 'Cancelled', label: 'Đã hủy',    count: counts.Cancelled },
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
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            Tiếp tục mua sắm <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
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
            <p className="mt-1 text-sm text-muted-foreground">Hãy mua sắm để tạo đơn hàng đầu tiên!</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90">
              Mua ngay
            </Link>
          </div>
        )}

        {/* Order List */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 space-y-4">
            {filtered.map(order => (
              <article key={order.id} className="rounded-xl border border-border bg-card p-6">
                {/* Order header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif font-bold">Đơn #{order.id}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="text-lg font-bold">
                    {parseFloat(String(order.totalPrice)).toLocaleString('vi-VN')}đ
                  </span>
                </div>

                {/* Product */}
                <div className="mt-4 flex items-center gap-4 rounded-lg bg-secondary/50 p-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                    {order.product?.imageUrl ? (
                      <img
                        src={order.product.imageUrl.startsWith('/')
                          ? `https://localhost:7084${order.product.imageUrl}`
                          : order.product.imageUrl}
                        alt={order.product.name}
                        className="h-full w-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
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

                {/* Cancel — chỉ hiện khi Pending hoặc Packing */}
                <CancelButton order={order} onCancelled={handleOrderCancelled} />

                {/* Review — chỉ hiện khi Delivered */}
                <ReviewSection order={order} />
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