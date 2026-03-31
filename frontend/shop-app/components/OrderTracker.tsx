"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Map, X } from 'lucide-react'

// Dynamically import Map component with no SSR to avoid 'window is not defined' errors
const OrderTrackerMap = dynamic(() => import('./OrderTrackerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-slate-50 animate-pulse rounded-xl flex items-center justify-center text-sm text-slate-500">
      Đã tải Dữ liệu Cơ bản. Đang tải Thư viện Bản đồ...
    </div>
  )
})

export function OrderTracker({ 
  orderId, 
  sellerId, 
  shipperId, 
  userId 
}: { 
  orderId: number, 
  sellerId: number, 
  shipperId?: number | null, 
  userId: number 
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <div className="mt-4 flex pb-2 border-b border-border/50">
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/50 text-blue-700 border border-blue-200 px-4 py-2 text-xs font-medium hover:bg-blue-100 transition-colors"
        >
          <Map className="h-4 w-4" />
          Định vị Bản đồ Giao hàng & ETA
        </button>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
          <Map className="h-4 w-4 text-blue-600" />
          Bản đồ Live Tracking - Đơn #{orderId}
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-1">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="p-3">
        <OrderTrackerMap sellerId={sellerId} shipperId={shipperId} userId={userId} />
      </div>
    </div>
  )
}
