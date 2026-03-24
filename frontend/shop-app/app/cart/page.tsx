"use client"

import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, Package, Loader2 } from 'lucide-react'
import { useCart, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'

function CartContent() {
  const { items, sellerGroups, updateQty, removeFromCart, totalItems, totalPrice, loading } = useCart()

  const handleRemove = async (productId: string, name: string) => {
    try {
      await removeFromCart(productId)
      toast.success(`Đã xoá "${name}" khỏi giỏ hàng`)
    } catch {
      toast.error('Không thể xoá sản phẩm')
    }
  }

  const handleUpdateQty = async (productId: string, quantity: number) => {
    try {
      await updateQty(productId, quantity)
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Không thể cập nhật số lượng')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-bold">Giỏ hàng trống</h1>
            <p className="mt-2 text-muted-foreground">
              Hãy thêm sản phẩm vào giỏ để tiếp tục mua sắm
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3"
            >
              Tiếp tục mua sắm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Tiếp tục mua sắm
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">
            Giỏ hàng
            <span className="ml-2 text-lg font-normal text-muted-foreground">
              ({totalItems} sản phẩm)
            </span>
          </h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items — nhóm theo seller */}
          <div className="lg:col-span-2 space-y-4">
            {sellerGroups.length > 0 ? (
              sellerGroups.map((group) => (
                <div key={group.sellerId} className="rounded-xl border border-border bg-card overflow-hidden">
                  {/* Seller header */}
                  <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{group.sellerName || 'Shop'}</span>
                  </div>

                  <div className="divide-y divide-border">
                    {group.items.map((item) => (
                      <div key={item.productId} className="flex gap-4 p-4 sm:p-6">
                        {/* Image */}
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl.startsWith('/')
                                ? `http://localhost:5159${item.imageUrl}`
                                : item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium leading-tight line-clamp-2">{item.name}</h3>
                            <button
                              onClick={() => handleRemove(item.productId, item.name)}
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                              aria-label="Xóa sản phẩm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <p className="mt-1 text-sm text-primary font-medium">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-3">
                            {/* Quantity */}
                            <div className="flex items-center gap-1 rounded-full border border-border bg-background">
                              <button
                                onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors"
                                aria-label="Giảm số lượng"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Tăng số lượng"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="font-bold">{item.subtotal.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Fallback nếu sellerGroups rỗng — hiển thị flat list
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 sm:p-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl.startsWith('/') ? `http://localhost:5159${item.imageUrl}` : item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-2">{item.name}</h3>
                        <button onClick={() => handleRemove(item.productId, item.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-primary font-medium">{item.price.toLocaleString('vi-VN')}đ</p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center gap-1 rounded-full border border-border bg-background">
                          <button onClick={() => handleUpdateQty(item.productId, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => handleUpdateQty(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="font-bold">{item.subtotal.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Tóm tắt đơn hàng</h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <div className="my-6 h-px bg-border" />

              <div className="flex items-center justify-between">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-xl font-bold">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>

              <Link
                href="/checkout"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3"
              >
                Tiến hành thanh toán
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3 text-sm font-medium transition-colors hover:bg-secondary"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CartPage() {
  return (
    <Providers>
      <CartContent />
    </Providers>
  )
}