"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Eye, EyeOff, Package2 } from 'lucide-react'
import { useAuth, Providers } from '@/components/providers'
import { toast } from 'sonner'

function LoginContent() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Đăng nhập thành công!')
      router.push('/')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Email hoặc mật khẩu không đúng!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Back link */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Về trang chủ
            </Link>

            {/* Header */}
            <div className="mt-8">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package2 className="h-5 w-5" />
                </div>
                <span className="font-serif text-xl font-bold">MyShop</span>
              </Link>
              <h1 className="mt-8 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
                Chào mừng trở lại
              </h1>
              <p className="mt-2 text-muted-foreground">
                Đăng nhập để tiếp tục mua sắm
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="mt-2 block h-12 w-full rounded-lg border border-input bg-card px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Mật khẩu
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={form.password}
                    onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="block h-12 w-full rounded-lg border border-input bg-card px-4 pr-12 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Right side - Image/Pattern */}
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <div className="max-w-md text-center">
                <h2 className="font-serif text-3xl font-bold">
                  Mua sắm dễ dàng,
                  <br />giao hàng nhanh chóng
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Khám phá hàng ngàn sản phẩm chất lượng cao với giá tốt nhất. 
                  Giao hàng miễn phí cho đơn hàng từ 500.000đ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Providers>
      <LoginContent />
    </Providers>
  )
}
