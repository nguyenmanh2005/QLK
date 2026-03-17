"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowLeft, ArrowRight, Loader2, ShoppingBag, AlertCircle, CheckSquare, Square } from 'lucide-react'
import { orderService, useCart, useAuth, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function CheckoutContent() {
  const { items, totalItems, clearCart, removeFromCart } = useCart()
  const { user, isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Set các productId được chọn để thanh toán — mặc định chọn tất cả
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => new Set(items.map(i => i.id)))

  const selectedItems = items.filter(i => selectedIds.has(i.id))
  const selectedTotalItems = selectedItems.reduce((s, i) => s + i.quantity, 0)
  const selectedTotalPrice = selectedItems.reduce((s, i) => s + parseFloat(String(i.price)) * i.quantity, 0)

  const allSelected = selectedIds.size === items.length && items.length > 0
  const noneSelected = selectedIds.size === 0

  const toggleItem = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(items.map(i => i.id)))
    }
  }

  // Not logged in
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
              Vui lòng đăng nhập để tiếp tục đặt hàng
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

  // Empty cart
  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="mt-6 font-serif text-xl font-bold">Giỏ hàng trống</h1>
            <p className="mt-2 text-muted-foreground">
              Hãy thêm sản phẩm trước khi thanh toán
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Mua sắm ngay
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // Handle order — chỉ đặt các sản phẩm đã chọn
  const handleOrder = async () => {
    if (noneSelected) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm!')
      return
    }

    setLoading(true)
    setErrors([])
    const failed: string[] = []
    const succeeded: number[] = []

    for (const item of selectedItems) {
      try {
        await orderService.create({
          userId: parseInt(user!.id),
          productId: item.id,
          quantity: item.quantity,
        })
        succeeded.push(item.id)
      } catch (err: unknown) {
        const error = err as Error
        failed.push(`${item.name}: ${error.message || 'Lỗi không xác định'}`)
      }
    }

    setLoading(false)

    if (failed.length === 0) {
      // Xóa khỏi giỏ hàng các sản phẩm đã đặt thành công
      succeeded.forEach(id => removeFromCart(id))
      setSuccess(true)
    } else {
      setErrors(failed)
      // Xóa khỏi giỏ hàng các sản phẩm đặt thành công (nếu đặt một phần)
      succeeded.forEach(id => removeFromCart(id))
      if (succeeded.length > 0) {
        toast.success(`${succeeded.length} sản phẩm đã được đặt thành công!`)
      } else {
        toast.error('Đặt hàng thất bại!')
      }
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-bold">Đặt hàng thành công!</h1>
            <p className="mt-2 text-muted-foreground">
              Cảm ơn bạn đã mua sắm tại MyShop
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Xem đơn hàng
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại giỏ hàng
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">
            Xác nhận đơn hàng
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Thông tin người mua</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Họ tên</span>
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Order Items with selection */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold">
                  Sản phẩm
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({totalItems})
                  </span>
                </h2>
                {/* Chọn tất cả */}
                <button
                  onClick={toggleAll}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {allSelected
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4" />
                  }
                  {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
              </div>

              <div className="mt-4 divide-y divide-border">
                {items.map((item) => {
                  const checked = selectedIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleItem(item.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-4 py-4 first:pt-0 last:pb-0 rounded-lg px-2 -mx-2 transition-colors",
                        checked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/50 opacity-50"
                      )}
                    >
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        {checked
                          ? <CheckSquare className="h-5 w-5 text-primary" />
                          : <Square className="h-5 w-5 text-muted-foreground" />
                        }
                      </div>

                      {/* Image */}
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl?.startsWith('/')
                              ? `http://localhost:5159${item.imageUrl}`
                              : item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                      </div>

                      {/* Price */}
                      <p className={cn(
                        "text-sm font-bold flex-shrink-0",
                        !checked && "line-through text-muted-foreground"
                      )}>
                        {(parseFloat(String(item.price)) * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Selection summary */}
              {!allSelected && selectedIds.size > 0 && (
                <p className="mt-4 text-xs text-muted-foreground text-right">
                  Đã chọn {selectedIds.size}/{items.length} sản phẩm
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Tóm tắt thanh toán</h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tạm tính ({selectedTotalItems} sản phẩm{selectedIds.size < items.length ? ` / đã chọn ${selectedIds.size}` : ''})
                  </span>
                  <span>{selectedTotalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="flex items-center justify-between">
                <span className="font-medium">Tổng thanh toán</span>
                <span className="text-xl font-bold">
                  {selectedTotalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="mt-4 rounded-lg bg-destructive/10 p-4">
                  <p className="text-sm font-medium text-destructive">Các sản phẩm lỗi:</p>
                  {errors.map((e, i) => (
                    <p key={i} className="mt-1 text-xs text-destructive">• {e}</p>
                  ))}
                </div>
              )}

              {/* None selected warning */}
              {noneSelected && (
                <div className="mt-4 rounded-lg bg-amber-500/10 p-4">
                  <p className="text-sm font-medium text-amber-600">
                    Vui lòng chọn ít nhất một sản phẩm để thanh toán
                  </p>
                </div>
              )}

              <button
                onClick={handleOrder}
                disabled={loading || noneSelected}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Xác nhận đặt hàng
                    {selectedIds.size < items.length && selectedIds.size > 0 && (
                      <span className="ml-1 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">
                        {selectedIds.size} món
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Bằng việc đặt hàng, bạn đồng ý với điều khoản sử dụng của MyShop
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Providers>
      <CheckoutContent />
    </Providers>
  )
}