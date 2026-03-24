"use client"

import { useEffect, useState } from 'react'
import { Truck, CheckCircle2, Clock, Loader2, Package, LogOut, PackageCheck, RotateCcw } from 'lucide-react'
import { useRequireAuth, useAuth, orderService, Providers, type Order } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function OrdersContent() {
  const { isAuth, loading }           = useRequireAuth()
  const { shipper, logout }           = useAuth()
  const [tab, setTab]                 = useState<'available' | 'delivering' | 'delivered'>('available')
  const [available, setAvailable]     = useState<Order[]>([])
  const [delivering, setDelivering]   = useState<Order[]>([])
  const [delivered, setDelivered]     = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [actionId, setActionId]       = useState<number | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)

  const loadData = async () => {
    setLoadingData(true)
    try {
      const [a, del, done] = await Promise.all([
        orderService.getAvailable().catch(() => []),
        orderService.getMyDelivering().catch(() => []),
        orderService.getMyDelivered().catch(() => []),
      ])
      setAvailable(Array.isArray(a)    ? a    : [])
      setDelivering(Array.isArray(del) ? del  : [])
      setDelivered(Array.isArray(done) ? done : [])
    } catch {
      toast.error('Không tải được dữ liệu!')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    if (!loading && isAuth) loadData()
  }, [isAuth, loading])

  const handleAssign = async (id: number) => {
    setActionId(id)
    try {
      await orderService.assignOrder(id)
      toast.success('Nhận đơn thành công!')
      loadData()
      setTab('delivering')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Nhận đơn thất bại!')
    } finally {
      setActionId(null)
    }
  }

  const handleConfirm = async (id: number) => {
    setActionId(id)
    try {
      await orderService.confirmDelivered(id)
      toast.success('Xác nhận giao hàng thành công!')
      loadData()
      setTab('delivered')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Xác nhận thất bại!')
    } finally {
      setActionId(null)
    }
  }

  const handleReturn = async (id: number) => {
    if (!confirm('Xác nhận hoàn hàng? Đơn sẽ được trả lại cho seller.')) return
    setReturningId(id)
    try {
      await orderService.returnOrder(id)
      toast.success('Hoàn hàng thành công!')
      loadData()
      setTab('available')
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Hoàn hàng thất bại!')
    } finally {
      setReturningId(null)
    }
  }

  if (loading || loadingData) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
    </div>
  )

  const tabs = [
    { key: 'available',  label: 'Chờ nhận',  icon: Package,      count: available.length,  color: 'bg-yellow-600' },
    { key: 'delivering', label: 'Đang giao',  icon: Truck,        count: delivering.length, color: 'bg-indigo-600' },
    { key: 'delivered',  label: 'Đã giao',    icon: PackageCheck, count: delivered.length,  color: 'bg-emerald-600' },
  ] as const

  const current = tab === 'available' ? available
                : tab === 'delivering' ? delivering
                : delivered

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{shipper?.name}</p>
              <p className="text-xs text-slate-400">Shipper Portal</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all text-sm">
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <div key={t.key} className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.color + '/10')}>
                    <Icon className={cn("h-4 w-4",
                      t.key === 'available'  ? 'text-yellow-400' :
                      t.key === 'delivering' ? 'text-indigo-400' : 'text-emerald-400'
                    )} />
                  </div>
                </div>
                <p className="text-xl font-bold text-white">{t.count}</p>
                <p className="text-xs text-slate-400">{t.label}</p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2 mb-6">
          {tabs.map(t => {
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  tab === t.key
                    ? t.color + " text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                )}>
                <Icon className="h-4 w-4" />
                {t.label}
                <span className="text-xs opacity-70">({t.count})</span>
              </button>
            )
          })}
        </div>

        {current.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package className="h-12 w-12 text-slate-600 mb-4" />
            <p className="text-slate-400">
              {tab === 'available'  ? 'Không có đơn nào chờ nhận' :
               tab === 'delivering' ? 'Bạn chưa nhận đơn nào'     :
               'Chưa có đơn nào đã giao'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {current.map(order => (
              <div key={order.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold text-white">
                          {order.productName || `#${order.productId}`}
                        </h3>
                        <p className="text-xs text-slate-500">Đơn #{order.id}</p>
                      </div>
                      <span className={cn(
                        "text-xs px-2.5 py-1 rounded-full border",
                        tab === 'available'
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : tab === 'delivering'
                          ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      )}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">
                      SL: <span className="text-slate-300">{order.quantity}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <p className="font-bold text-white">
                      {Number(order.totalPrice).toLocaleString('vi-VN')}đ
                    </p>
                    {tab === 'available' && (
                      <button onClick={() => handleAssign(order.id)}
                        disabled={actionId === order.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-medium transition-all disabled:opacity-60">
                        {actionId === order.id
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Truck className="h-3 w-3" />
                        }
                        Nhận đơn
                      </button>
                    )}
                    {tab === 'delivering' && (
                      <div className="flex flex-col gap-2">
                        <button onClick={() => handleConfirm(order.id)}
                          disabled={actionId === order.id || returningId === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all disabled:opacity-60">
                          {actionId === order.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <CheckCircle2 className="h-3 w-3" />
                          }
                          Đã giao
                        </button>
                        <button onClick={() => handleReturn(order.id)}
                          disabled={actionId === order.id || returningId === order.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-all disabled:opacity-60">
                          {returningId === order.id
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <RotateCcw className="h-3 w-3" />
                          }
                          Hoàn hàng
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return <Providers><OrdersContent /></Providers>
}