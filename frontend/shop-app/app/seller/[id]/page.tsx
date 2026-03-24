"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Store, Star, Package, Loader2, Phone } from 'lucide-react'
import { sellerService, sellerReviewService, productService, type Product, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SellerProfile {
  id: number
  name: string
  email: string
  phoneNumber?: string
  createdAt: string
}

interface SellerRating {
  sellerId: number
  averageRating: number
  totalReviews: number
}

function SellerPageContent() {
  const params = useParams()
  const sellerId = parseInt(params.id as string)

  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [rating, setRating] = useState<SellerRating | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sellerId) return

    Promise.all([
      sellerService.getById(sellerId),
      sellerReviewService.getRating(sellerId),
      productService.getBySeller(sellerId)
    ])
      .then(([sellerData, ratingData, productsData]) => {
        setSeller(sellerData)
        setRating(ratingData)
        setProducts(productsData || [])
      })
      .catch(() => toast.error('Không tải được thông tin cửa hàng!'))
      .finally(() => setLoading(false))
  }, [sellerId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải hồ sơ cửa hàng...</p>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-24 text-center">
          <Store className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold">Không tìm thấy cửa hàng</h1>
          <p className="mt-2 text-muted-foreground">Cửa hàng này không tồn tại hoặc đã bị ẩn.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      {/* Seller Header */}
      <div className="bg-primary/5 border-b border-border/50">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-sm">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-serif font-bold text-foreground">{seller.name}</h1>
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full border border-amber-200">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium text-amber-700">
                    {rating && rating.totalReviews > 0 ? `${rating.averageRating.toFixed(1)} / 5.0` : 'Chưa có đánh giá'}
                  </span>
                  {rating && rating.totalReviews > 0 && <span className="text-amber-700/60 ml-1">({rating.totalReviews} lượt)</span>}
                </div>
                
                {seller.phoneNumber && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-border">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{seller.phoneNumber}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-border">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{products.length} sản phẩm</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Tham gia từ tháng {new Date(seller.createdAt).getMonth() + 1}, năm {new Date(seller.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Products */}
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          Sản phẩm của shop <span className="text-muted-foreground font-normal text-lg">({products.length})</span>
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border/50 rounded-2xl shadow-sm">
            <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Cửa hàng chưa có sản phẩm nào</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
            {products.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group relative block">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-secondary/50 border border-border/50">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl.startsWith('/') ? `http://localhost:5159${product.imageUrl}` : product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-1">
                  <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
                  <p className="text-sm font-bold text-primary">
                    {parseFloat(String(product.price)).toLocaleString('vi-VN')}₫
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function SellerPage() {
  return (
    <Providers>
      <SellerPageContent />
    </Providers>
  )
}
