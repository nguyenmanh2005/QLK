"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, User, LogOut, Menu, X, Package2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth, useCart } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { user, logout, isAuth } = useAuth()
  const { totalItems } = useCart()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Đã đăng xuất!')
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform group-hover:scale-105">
              <Package2 className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-semibold tracking-tight">
              MyShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-1">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sản phẩm
            </Link>
            {isAuth && (
              <Link 
                href="/orders" 
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Đơn hàng
              </Link>
            )}
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex md:items-center md:gap-3">
            {/* Cart */}
            <Link 
              href="/cart" 
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {isAuth ? (
              <div className="flex items-center gap-2">
                <Link 
                  href="/orders" 
                  className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-24 truncate">{user?.name}</span>
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register" 
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <Link 
              href="/cart" 
              className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-96 pb-4" : "max-h-0"
        )}>
          <div className="flex flex-col gap-1 pt-2">
            <Link 
              href="/" 
              className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sản phẩm
            </Link>
            {isAuth && (
              <Link 
                href="/orders" 
                className="rounded-lg px-4 py-3 text-sm font-medium hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đơn hàng
              </Link>
            )}
            <div className="my-2 h-px bg-border" />
            {isAuth ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }} 
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-4">
                <Link 
                  href="/login" 
                  className="w-full rounded-lg border border-border py-2.5 text-center text-sm font-medium hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link 
                  href="/register" 
                  className="w-full rounded-lg bg-primary py-2.5 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
