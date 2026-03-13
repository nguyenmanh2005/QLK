"use client"

import { ShoppingBag, Package, Plus } from 'lucide-react'
import { useCart, type Product, PRODUCT_BASE_URL } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith('/') ? `${PRODUCT_BASE_URL}${product.imageUrl}` : product.imageUrl)
    : null

  const handleAddToCart = () => {
    if (product.stock < 1) {
      toast.error('Sản phẩm đã hết hàng!')
      return
    }
    addToCart(product, 1)
    toast.success(`Đã thêm "${product.name}" vào giỏ!`)
  }

  const isOutOfStock = product.stock < 1

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:shadow-muted/50 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const fallback = target.nextElementSibling as HTMLElement
              if (fallback) fallback.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className={cn(
            "absolute inset-0 items-center justify-center bg-muted",
            imgSrc ? "hidden" : "flex"
          )}
        >
          <Package className="h-12 w-12 text-muted-foreground/30" />
        </div>

        {/* Quick Add Button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 hover:scale-110 group-hover:opacity-100"
            aria-label="Thêm vào giỏ hàng"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}

        {/* Out of Stock Badge */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <span className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-foreground/80 transition-colors">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-lg font-bold tracking-tight">
                {parseFloat(String(product.price)).toLocaleString('vi-VN')}
                <span className="text-sm font-medium">đ</span>
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </p>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn(
              "mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all",
              isOutOfStock 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98]"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </article>
  )
}