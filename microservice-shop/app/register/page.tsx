"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Eye, EyeOff, Package2, CheckCircle2 } from 'lucide-react'
import { useAuth, Providers } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function RegisterContent() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const passwordRequirements = [
    { met: form.password.length >= 6, text: 'Ít nhất 6 ký tự' },
    { met: /[A-Z]/.test(form.password), text: 'Có ít nhất 1 chữ hoa' },
    { met: /[0-9]/.test(form.password), text: 'Có ít nhất 1 số' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (form.password.length < 6) {
      setError('Mật khẩu phải ít nhất 6 ký tự!')
      return
    }
    
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      router.push('/login')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Left side - Image/Pattern */}
        <div className="relative hidden flex-1 lg:block">
          <div className="absolute inset-0 bg-gradient-to-bl from-secondary to-muted">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
              <div className="max-w-md text-center">
                <h2 className="font-serif text-3xl font-bold">
                  Tham gia cộng đồng
                  <br />mua sắm thông minh
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Tạo tài khoản để theo dõi đơn hàng, nhận ưu đãi độc quyền 
                  và trải nghiệm mua sắm cá nhân hóa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
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
                Tạo tài khoản mới
              </h1>
              <p className="mt-2 text-muted-foreground">
                Đăng ký để bắt đầu mua sắm
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
                <label htmlFor="name" className="block text-sm font-medium">
                  Họ và tên
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="mt-2 block h-12 w-full rounded-lg border border-input bg-card px-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

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
                    autoComplete="new-password"
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

                {/* Password requirements */}
                {form.password.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={cn(
                          "h-4 w-4",
                          req.met ? "text-green-600" : "text-muted-foreground/40"
                        )} />
                        <span className={cn(
                          "text-xs",
                          req.met ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Tạo tài khoản'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Đăng nhập
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Bằng việc đăng ký, bạn đồng ý với{' '}
              <a href="#" className="underline hover:text-foreground">Điều khoản dịch vụ</a>
              {' '}và{' '}
              <a href="#" className="underline hover:text-foreground">Chính sách bảo mật</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Providers>
      <RegisterContent />
    </Providers>
  )
}
