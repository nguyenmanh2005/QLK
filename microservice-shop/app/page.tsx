"use client"

import { useEffect, useState } from 'react'
import { Search, Loader2, Package, ArrowRight, Sparkles } from 'lucide-react'
import { productService, type Product } from '@/components/providers'
import { ProductCard } from '@/components/product-card'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    productService.getAll()
      .then(data => setProducts(Array.isArray(data) ? data : data.data || []))
      .catch(() => toast.error('Không tải được sản phẩm!'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">Chất lượng hàng đầu</span>
              </div>
              <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                Mua sắm thông minh,
                <br />
                <span className="text-muted-foreground">sống phong cách</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
                Khám phá bộ sưu tập sản phẩm được chọn lọc kỹ lưỡng, 
                mang đến trải nghiệm mua sắm tuyệt vời nhất cho bạn.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <a 
                  href="#products" 
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3"
                >
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                Tất cả sản phẩm
              </h2>
              <p className="mt-1 text-muted-foreground">
                {products.length} sản phẩm có sẵn
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Đang tải sản phẩm...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium">Không tìm thấy sản phẩm</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {search ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sản phẩm nào'}
              </p>
            </div>
          )}

          {/* Product Grid */}
          {!loading && filtered.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500.000đ' },
                { title: 'Đổi trả dễ dàng', desc: 'Trong vòng 30 ngày' },
                { title: 'Thanh toán an toàn', desc: 'Bảo mật tuyệt đối' },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="font-serif text-lg font-bold">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-medium">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                © 2026 MyShop. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Điều khoản
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Chính sách
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Liên hệ
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Providers>
      <HomeContent />
    </Providers>
  )
}
