"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Package, ShoppingBag, Star, UserCircle2,
  Store, Box, Loader2, AlertCircle, ChevronRight, ShieldCheck,
} from 'lucide-react'
import {
  productService, reviewService,
  useCart, Providers,
  type Product, type Review,
  PRODUCT_BASE_URL,
} from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ==================== TYPES ====================
interface SellerProfile {
  id: number
  name: string
  email: string
}

// ==================== STAR DISPLAY ====================
function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={cn(
          size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5',
          s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
        )} />
      ))}
    </div>
  )
}

// ==================== RATING BAR ====================
function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 text-right text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-5 text-xs text-muted-foreground">{count}</span>
    </div>
  )
}

// ==================== REVIEW SECTION ====================
function ReviewSection({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewService.getByProduct(productId)
      .then((data: Review[]) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  const total  = reviews.length
  const avg    = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const byStar = (s: number) => reviews.filter(r => r.rating === s).length

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl font-bold">
        Đánh giá sản phẩm
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">({total})</span>
        )}
      </h2>

      {total > 0 && (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row">
          <div className="flex flex-col items-center justify-center sm:w-32">
            <span className="text-5xl font-bold">{avg.toFixed(1)}</span>
            <StarDisplay rating={Math.round(avg)} size="lg" />
            <span className="mt-1 text-xs text-muted-foreground">{total} đánh giá</span>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} label={`${s} sao`} count={byStar(s)} total={total} />
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
          <Star className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 font-medium">Chưa có đánh giá</p>
          <p className="mt-1 text-sm text-muted-foreground">Hãy mua và trải nghiệm sản phẩm này!</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map(review => (
          <article key={review.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                <UserCircle2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{review.userName}</span>
                  <StarDisplay rating={review.rating} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                    })}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold">{review.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                {review.imageUrl && (
                  <img
                    src={review.imageUrl.startsWith('/') ? `${PRODUCT_BASE_URL}${review.imageUrl}` : review.imageUrl}
                    alt="Ảnh đánh giá"
                    className="mt-3 h-32 w-32 rounded-lg object-cover border border-border"
                  />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ==================== SELLER SECTION ====================
function SellerSection({ sellerId }: { sellerId: number }) {
  const [seller, setSeller]             = useState<SellerProfile | null>(null)
  const [products, setProducts]         = useState<Product[]>([])
  const [sellerAvg, setSellerAvg]       = useState<number | null>(null)
  const [totalReviews, setTotalReviews] = useState(0)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const [userRes, productsRes] = await Promise.all([
          fetch(`http://localhost:5183/api/seller/${sellerId}`),
          productService.getBySeller(sellerId).catch(() => []),
        ])

        if (userRes.ok) {
          const userData = await userRes.json()
          setSeller(userData)
        }
        // Nếu 404 thì seller = null, không crash

        const list: Product[] = Array.isArray(productsRes) ? productsRes : []
        setProducts(list)

        // Fetch reviews của tất cả sản phẩm song song rồi tính điểm trung bình tổng
        if (list.length > 0) {
          const allReviewArrays = await Promise.all(
            list.map(p => reviewService.getByProduct(p.id).catch(() => [] as Review[]))
          )
          const allReviews = allReviewArrays.flat()
          setTotalReviews(allReviews.length)
          if (allReviews.length > 0) {
            const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
            setSellerAvg(avg)
          }
        }
      } catch {
        // Không làm gì, chỉ không hiện seller section
      } finally {
        setLoading(false)
      }
    }

    fetchSeller()
  }, [sellerId])

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
    </div>
  )

  // Không có seller data thì không render gì
  if (!seller) return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
      <Store className="h-10 w-10 text-muted-foreground/30" />
      <p className="mt-3 font-medium">Không tìm thấy thông tin người bán</p>
    </div>
  )

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-xl font-bold">Thông tin người bán</h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Store className="h-7 w-7 text-primary" />
        </div>
        <div>
          <p className="font-semibold">{seller.name}</p>
          <p className="text-sm text-muted-foreground">{seller.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {products.length} sản phẩm đang bán
          </p>
          {/* Điểm đánh giá tổng của seller */}
          {sellerAvg !== null ? (
            <div className="mt-2 flex items-center gap-2">
              <StarDisplay rating={Math.round(sellerAvg)} size="sm" />
              <span className="text-xs font-semibold text-amber-500">{sellerAvg.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({totalReviews} đánh giá)</span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Chưa có đánh giá</p>
          )}
        </div>
      </div>

      {products.length > 1 && (
        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Sản phẩm khác của người bán</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {products.slice(0, 6).map(p => {
              const imgSrc = p.imageUrl
                ? (p.imageUrl.startsWith('/') ? `${PRODUCT_BASE_URL}${p.imageUrl}` : p.imageUrl)
                : null
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="line-clamp-1 text-xs font-medium">{p.name}</p>
                    <p className="mt-0.5 text-xs font-bold text-primary">
                      {parseFloat(String(p.price)).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ==================== MAIN CONTENT ====================
function ProductDetailContent() {
  const params    = useParams()
  const productId = parseInt(params.id as string)
  const { addToCart } = useCart()

  const [product, setProduct]     = useState<Product | null>(null)
  const [loading, setLoading]     = useState(true)
  const [qty, setQty]             = useState(1)
  const [activeTab, setActiveTab] = useState<'reviews' | 'seller'>('reviews')

  useEffect(() => {
    productService.getById(productId)
      .then(setProduct)
      .catch(() => toast.error('Không tải được sản phẩm!'))
      .finally(() => setLoading(false))
  }, [productId])

  const handleAddToCart = () => {
    if (!product) return
    if (product.stock < 1) { toast.error('Sản phẩm đã hết hàng!'); return }
    addToCart(product, qty)
    toast.success(`Đã thêm "${product.name}" vào giỏ!`)
  }

  const imgSrc = product?.imageUrl
    ? (product.imageUrl.startsWith('/') ? `${PRODUCT_BASE_URL}${product.imageUrl}` : product.imageUrl)
    : null

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </div>
  )

  if (!product) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-md px-4 py-24 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-serif text-xl font-bold">Không tìm thấy sản phẩm</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Về trang chủ
        </Link>
      </main>
    </div>
  )

  const isOutOfStock = product.stock < 1

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        {/* Product */}
        <div className="grid gap-10 lg:grid-cols-2">

          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-muted">
            {imgSrc ? (
              <img src={imgSrc} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl font-bold leading-snug sm:text-3xl">
              {product.name}
            </h1>

            {product.description && (
              <p className="mt-3 leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            <div className="mt-6">
              <p className="text-3xl font-bold">
                {parseFloat(String(product.price)).toLocaleString('vi-VN')}
                <span className="text-lg font-medium">đ</span>
              </p>
              <p className={cn(
                "mt-1 text-sm font-medium",
                isOutOfStock ? "text-destructive" : "text-green-600"
              )}>
                {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
              </p>
            </div>

            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-medium">Số lượng</span>
                <div className="flex items-center overflow-hidden rounded-lg border border-border">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-lg hover:bg-secondary transition-colors"
                  >
                    −
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center text-sm font-medium">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="flex h-10 w-10 items-center justify-center text-lg hover:bg-secondary transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={cn(
                "mt-6 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-medium transition-all",
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99]"
              )}
            >
              <ShoppingBag className="h-4 w-4" />
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
                <Box className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1.5 text-sm font-semibold">{product.stock}</p>
                <p className="text-xs text-muted-foreground">Còn trong kho</p>
              </div>
              <div className="rounded-xl border border-border bg-secondary/30 p-4 text-center">
                <ShieldCheck className="mx-auto h-5 w-5 text-muted-foreground" />
                <p className="mt-1.5 text-sm font-semibold">Chính hãng</p>
                <p className="text-xs text-muted-foreground">Có bảo hành</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-border">
            {[
              { key: 'reviews', label: 'Đánh giá' },
              ...(product.sellerId ? [{ key: 'seller', label: 'Người bán' }] : []),
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'reviews' | 'seller')}
                className={cn(
                  "px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'reviews' && <ReviewSection productId={productId} />}
            {activeTab === 'seller' && product.sellerId && (
              <SellerSection sellerId={product.sellerId} />
            )}
          </div>
        </div>

      </main>
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Providers>
      <ProductDetailContent />
    </Providers>
  )
}