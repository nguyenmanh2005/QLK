"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Store, LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'
import { useAuth } from '@/components/providers'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { seller, logout } = useAuth()
  const pathname = usePathname()

  const nav = [
    { href: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
    { href: '/products',  label: 'Sản phẩm',   icon: Package },
    { href: '/orders',    label: 'Đơn hàng',    icon: ShoppingBag },
  ]

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{seller?.name}</p>
            <p className="text-xs text-slate-400">{seller?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map(item => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}