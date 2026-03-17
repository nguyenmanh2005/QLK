"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Truck, Loader2 } from 'lucide-react'
import { useAuth, Providers } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SHIPPER_API = 'http://localhost:5184'

function LoginContent() {
  const [tab, setTab]                   = useState<'login' | 'register'>('login')
  const [form, setForm]                 = useState({ name: '', email: '', password: '' })
  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const { login } = useAuth()
  const router    = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Đăng nhập thành công!')
      router.push('/orders')
    } catch (err: unknown) {
      setError((err as Error).message || 'Email hoặc mật khẩu không đúng!')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự!'); return }
    setLoading(true)
    try {
      const res = await fetch(`${SHIPPER_API}/api/shipper/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Đăng ký thất bại' }))
        throw new Error(err.message || 'Đăng ký thất bại')
      }
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      setTab('login')
      setForm(f => ({ ...f, name: '', password: '' }))
    } catch (err: unknown) {
      setError((err as Error).message || 'Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-900/50 mb-4">
            <Truck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Shipper Portal</h1>
          <p className="text-slate-400 mt-1">Quản lý giao hàng của bạn</p>
        </div>
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <div className="flex gap-1 p-1 bg-slate-800 rounded-xl mb-6">
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === t ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
                )}>
                {t === 'login' ? 'Đăng nhập' : 'Đăng ký'}
              </button>
            ))}
          </div>
          {error && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="shipper@example.com"
                  className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang đăng nhập...</> : 'Đăng nhập'}
              </button>
            </form>
          )}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Họ và tên</label>
                <input type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="shipper@example.com"
                  className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full h-12 rounded-xl bg-white/10 border border-white/10 px-4 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Ít nhất 6 ký tự</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang đăng ký...</> : 'Tạo tài khoản'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <Providers><LoginContent /></Providers>
}