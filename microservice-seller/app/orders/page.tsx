"use client"

import { useEffect, useState } from 'react'
import { Package, Loader2, ChevronDown } from 'lucide-react'
import { useRequireAuth, orderService, Providers, type Order } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  Pending:   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Packing:   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shipping:  'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  Cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const SELLER_ACTIONS: Record<string, string[]> = {
  Pending:  ['Packing'],
  Packing:  ['Shipping'],
  Shipping: [],
}

function OrdersContent() {
  const { isAuth, loading }           = useRequireAuth()
  const [orders, setOrders]           = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [updating, setUpdating]       = useState<number | null>(null)
  const [filter, setFilter]           = useState('')

  const load = async () => {
    setLoadingData(true)
    try {
      const data = await orderService.getAll()
      console.log('Orders response:', data)
      const list = Array.isArray(data) ? data : data?.data || []
      console.log('Orders list:', list)
      setOrders([...list].reverse())
    } catch (err) {
      console.error('Orders error:', err)
      toast.error('Không tải được đơn hàng!')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    console.log('useEffect - isAuth:', isAuth, 'loading:', loading)
    if (!loading && isAuth) load()
  }, [isAuth, loading])

const handleUpdateStatus = async (id: number, status: string) => {
  setUpdating(id)
  try {
    const result = await orderService.updateStatus(id, status)
    console.log('Update result:', result)   // <-- thêm dòng này
    toast.success(`Cập nhật thành công!`)
    load()
  } catch (err: unknown) {
    console.error('Update error:', err)     // <-- thêm dòng này
    toast.error((err as Error).message || 'Cập nhật thất bại!')
  } finally {
    setUpdating(null)
  }
}

  if (loading || loadingData) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const tabs = [
    { key: '',          label: 'Tất cả' },
    { key: 'Pending',   label: 'Chờ xử lý' },
    { key: 'Packing',   label: 'Đóng gói' },
    { key: 'Shipping',  label: 'Đang giao' },
    { key: 'Delivered', label: 'Đã giao' },
    { key: 'Cancelled', label: 'Đã hủy' },
  ]

  const filtered = filter ? orders.filter(o => o.status === filter) : orders

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Quản lý đơn hàng</h1>
        <p className="text-slate-400 mt-1">{orders.length} đơn hàng</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              filter === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            )}>
            {tab.label}
            <span className="ml-2 text-xs opacity-60">
              {tab.key ? orders.filter(o => o.status === tab.key).length : orders.length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package className="h-12 w-12 text-slate-600 mb-4" />
          <p className="text-slate-400">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">Đơn #{order.id}</h3>
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full border",
                      STATUS_COLORS[order.status] || STATUS_COLORS.Cancelled
                    )}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Sản phẩm: <span className="text-slate-300">
                      {order.productName || `#${order.productId}`}
                    </span>
                    {' · '}Số lượng: <span className="text-slate-300">{order.quantity}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
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
                  {SELLER_ACTIONS[order.status]?.map(action => (
                    <button key={action}
                      onClick={() => handleUpdateStatus(order.id, action)}
                      disabled={updating === order.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all disabled:opacity-60">
                      {updating === order.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <ChevronDown className="h-3 w-3" />
                      }
                      {action === 'Packing' ? 'Xác nhận đóng gói' : 'Xác nhận giao hàng'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <OrdersContent />
      </div>
    </Providers>
  )
}