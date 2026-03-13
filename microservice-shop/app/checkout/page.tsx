"use client"

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Package, ArrowLeft, ArrowRight, Loader2, ShoppingBag, AlertCircle } from 'lucide-react'
import { orderService, useCart, useAuth, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'

function CheckoutContent() {
  const { items, totalPrice, totalItems, clearCart } = useCart()
  const { user, isAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

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

  // Handle order
  const handleOrder = async () => {
    setLoading(true)
    setErrors([])
    const failed: string[] = []

    for (const item of items) {
      try {
        await orderService.create({
          userId: parseInt(user!.id),
          productId: item.id,
          quantity: item.quantity,
        })
      } catch (err: unknown) {
        const error = err as Error
        failed.push(`${item.name}: ${error.message || 'Lỗi không xác định'}`)
      }
    }

    setLoading(false)
    if (failed.length === 0) {
      clearCart()
      setSuccess(true)
    } else {
      setErrors(failed)
      if (failed.length < items.length) {
        toast.success('Một số sản phẩm đã được đặt thành công!')
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

            {/* Order Items */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">
                Sản phẩm 
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({totalItems})
                </span>
              </h2>
              <div className="mt-4 divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold">
                      {(parseFloat(String(item.price)) * item.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div>
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Tóm tắt thanh toán</h2>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính ({totalItems} sản phẩm)</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
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
                  {totalPrice.toLocaleString('vi-VN')}đ
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

              <button
                onClick={handleOrder}
                disabled={loading}
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
