"use client"

import { useEffect, useState, useRef } from 'react'
import { Search, Loader2, Package, ArrowRight, Sparkles, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { productService, type Product, type Category } from '@/components/providers'
import { ProductCard } from '@/components/product-card'
import { Navbar } from '@/components/navbar'
import { Providers } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ─── Price Filter Dropdown ─────────────────────────────────
function PriceFilterDropdown({
  minPrice, maxPrice,
  onApply, onClear,
}: {
  minPrice: string; maxPrice: string
  onApply: (min: string, max: string) => void
  onClear: () => void
}) {
  const [open, setOpen]   = useState(false)
  const [min, setMin]     = useState(minPrice)
  const [max, setMax]     = useState(maxPrice)
  const ref               = useRef<HTMLDivElement>(null)
  const isActive          = !!minPrice || !!maxPrice

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync state khi prop thay đổi (vd: clear từ bên ngoài)
  useEffect(() => { setMin(minPrice); setMax(maxPrice) }, [minPrice, maxPrice])

  const handleApply = () => {
    onApply(min, max)
    setOpen(false)
  }

  const handleClear = () => {
    setMin(''); setMax('')
    onClear()
    setOpen(false)
  }

  const PRESETS = [
    { label: 'Dưới 100.000đ',       min: '',         max: '100000' },
    { label: '100.000 – 500.000đ',  min: '100000',   max: '500000' },
    { label: '500.000 – 1.000.000đ',min: '500000',   max: '1000000' },
    { label: 'Trên 1.000.000đ',     min: '1000000',  max: '' },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
          isActive
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Giá
        {isActive && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-foreground/20 text-[10px] font-bold">
            1
          </span>
        )}
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-border bg-card p-4 shadow-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Khoảng giá
          </p>

          {/* Preset buttons */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setMin(p.min); setMax(p.max) }}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-xs transition-all",
                  min === p.min && max === p.max
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Manual input */}
          <p className="mb-2 text-xs text-muted-foreground">Hoặc nhập thủ công:</p>
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} placeholder="Từ"
              value={min}
              onChange={e => setMin(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="number" min={0} placeholder="Đến"
              value={max}
              onChange={e => setMax(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-secondary transition-colors"
            >
              Xóa
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HomeContent ───────────────────────────────────────────
function HomeContent() {
  const [products, setProducts]     = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [activeCat, setActiveCat]   = useState<number | null>(null)
  const [minPrice, setMinPrice]     = useState('')
  const [maxPrice, setMaxPrice]     = useState('')

  useEffect(() => {
    Promise.all([
      productService.getAll(),
      productService.getCategories().catch(() => []),
    ]).then(([prods, cats]) => {
      setProducts(Array.isArray(prods) ? prods : prods.data || [])
      setCategories(cats)
    }).catch(() => toast.error('Không tải được sản phẩm!'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat    = activeCat === null || p.categoryId === activeCat
    const price       = parseFloat(String(p.price))
    const matchMin    = !minPrice || price >= parseFloat(minPrice)
    const matchMax    = !maxPrice || price <= parseFloat(maxPrice)
    return matchSearch && matchCat && matchMin && matchMax
  })

  const hasFilter = !!search || activeCat !== null || !!minPrice || !!maxPrice

  const clearAll = () => {
    setSearch(''); setActiveCat(null); setMinPrice(''); setMaxPrice('')
  }

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
              <h2 className="font-serif text-2xl font-bold sm:text-3xl">Tất cả sản phẩm</h2>
              <p className="mt-1 text-muted-foreground">
                {hasFilter
                  ? `${filtered.length} / ${products.length} sản phẩm`
                  : `${products.length} sản phẩm có sẵn`
                }
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

          {/* Filter bar: category pills + price dropdown */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {/* Category pills */}
            {categories.length > 0 && (
              <>
                <button
                  onClick={() => setActiveCat(null)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium border transition-all",
                    activeCat === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  Tất cả
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium border transition-all",
                      activeCat === cat.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
                <div className="h-6 w-px bg-border mx-1" />
              </>
            )}

            {/* Price dropdown */}
            <PriceFilterDropdown
              minPrice={minPrice}
              maxPrice={maxPrice}
              onApply={(min, max) => { setMinPrice(min); setMaxPrice(max) }}
              onClear={() => { setMinPrice(''); setMaxPrice('') }}
            />

            {/* Active price tag */}
            {(minPrice || maxPrice) && (
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                {minPrice ? `${parseInt(minPrice).toLocaleString('vi-VN')}đ` : '0'}
                {' — '}
                {maxPrice ? `${parseInt(maxPrice).toLocaleString('vi-VN')}đ` : '∞'}
                <button onClick={() => { setMinPrice(''); setMaxPrice('') }}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {/* Clear all */}
            {hasFilter && (
              <button
                onClick={clearAll}
                className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <X className="h-3.5 w-3.5" /> Xóa tất cả
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Đang tải sản phẩm...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium">Không tìm thấy sản phẩm</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
              <button onClick={clearAll} className="mt-4 text-sm text-primary hover:underline">
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* Features */}
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { title: 'Miễn phí vận chuyển', desc: 'Cho đơn hàng từ 500.000đ' },
                { title: 'Đổi trả dễ dàng',     desc: 'Trong vòng 30 ngày' },
                { title: 'Thanh toán an toàn',   desc: 'Bảo mật tuyệt đối' },
              ].map((f, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="font-serif text-lg font-bold">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-medium">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">© 2026 MyShop. Tất cả quyền được bảo lưu.</p>
              <div className="flex gap-6">
                {['Điều khoản', 'Chính sách', 'Liên hệ'].map(t => (
                  <a key={t} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t}</a>
                ))}
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