"use client"

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, ShoppingBag, Package, BarChart3, RefreshCw } from 'lucide-react'
import { useRequireAuth, orderService, Providers, type Order } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'

// ─── helpers ──────────────────────────────────────────────
const fmt = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}tr`
    : n >= 1_000
    ? `${(n / 1_000).toFixed(0)}k`
    : String(n)

const fmtFull = (n: number) => n.toLocaleString('vi-VN') + 'đ'

type Range = '7d' | '30d' | '90d'

const STATUS_COLORS: Record<string, string> = {
  Pending:    '#eab308',
  Packing:    '#3b82f6',
  Shipping:   '#6366f1',
  Delivering: '#a855f7',
  Delivered:  '#22c55e',
  Cancelled:  '#ef4444',
  Returned:   '#f97316',
}

// ─── StatsContent ─────────────────────────────────────────
function StatsContent() {
  const { isAuth, loading }           = useRequireAuth()
  const [orders, setOrders]           = useState<Order[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [range, setRange]             = useState<Range>('30d')

  const load = async () => {
    setLoadingData(true)
    try {
      const data = await orderService.getAll()
      setOrders(Array.isArray(data) ? data : data?.data || [])
    } catch { }
    finally { setLoadingData(false) }
  }

  useEffect(() => {
    if (!loading && isAuth) load()
  }, [isAuth, loading])

  // ── KPIs ──────────────────────────────────────────────
  const delivered = useMemo(
    () => orders.filter(o => o.status === 'Delivered'),
    [orders]
  )
  const totalRevenue = useMemo(
    () => delivered.reduce((s, o) => s + Number(o.totalPrice), 0),
    [delivered]
  )
  const aov = delivered.length ? totalRevenue / delivered.length : 0

  // ── Revenue chart data ────────────────────────────────
  const revenueData = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const now   = new Date()
    const map   = new Map<string, number>()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = range === '90d'
        ? `T${d.getMonth() + 1}/${d.getFullYear()}`
        : `${d.getDate()}/${d.getMonth() + 1}`
      map.set(key, 0)
    }

    delivered.forEach(o => {
      const d   = new Date(o.createdAt)
      const daysAgo = (now.getTime() - d.getTime()) / 86_400_000
      if (daysAgo > days) return
      const key = range === '90d'
        ? `T${d.getMonth() + 1}/${d.getFullYear()}`
        : `${d.getDate()}/${d.getMonth() + 1}`
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + Number(o.totalPrice))
    })

    // For 90d: group by month (dedupe keys)
    const entries = [...map.entries()]
    if (range === '90d') {
      const monthly = new Map<string, number>()
      entries.forEach(([k, v]) => monthly.set(k, (monthly.get(k) ?? 0) + v))
      return [...monthly.entries()].map(([label, revenue]) => ({ label, revenue }))
    }
    return entries.map(([label, revenue]) => ({ label, revenue }))
  }, [delivered, range])

  // ── Pie chart data ────────────────────────────────────
  const pieData = useMemo(() => {
    const map = new Map<string, number>()
    orders.forEach(o => map.set(o.status, (map.get(o.status) ?? 0) + 1))
    return [...map.entries()].map(([name, value]) => ({ name, value }))
  }, [orders])

  // ── Top products ─────────────────────────────────────
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>()
    delivered.forEach(o => {
      const key  = String(o.productId)
      const name = o.productName || `#${o.productId}`
      const cur  = map.get(key) ?? { name, qty: 0, revenue: 0 }
      map.set(key, {
        name,
        qty:     cur.qty + o.quantity,
        revenue: cur.revenue + Number(o.totalPrice),
      })
    })
    return [...map.values()]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [delivered])

  if (loading || loadingData) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const kpis = [
    {
      label: 'Tổng doanh thu',
      value: fmtFull(totalRevenue),
      sub:   `${delivered.length} đơn đã giao`,
      icon:  TrendingUp,
      color: 'text-green-400',
      bg:    'bg-green-500/10',
    },
    {
      label: 'Tổng đơn hàng',
      value: orders.length,
      sub:   `${orders.filter(o => o.status === 'Pending').length} đơn chờ xử lý`,
      icon:  ShoppingBag,
      color: 'text-indigo-400',
      bg:    'bg-indigo-500/10',
    },
    {
      label: 'Giá trị trung bình',
      value: fmtFull(Math.round(aov)),
      sub:   'Mỗi đơn đã giao',
      icon:  BarChart3,
      color: 'text-yellow-400',
      bg:    'bg-yellow-500/10',
    },
    {
      label: 'Sản phẩm bán chạy',
      value: topProducts[0]?.name ?? '—',
      sub:   topProducts[0] ? `${topProducts[0].qty} đã bán` : '',
      icon:  Package,
      color: 'text-blue-400',
      bg:    'bg-blue-500/10',
    },
  ]

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Thống kê doanh thu</h1>
          <p className="text-slate-400 mt-1">Phân tích hiệu suất bán hàng</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {kpis.map((k, i) => {
          const Icon = k.icon
          return (
            <div key={i} className="rounded-2xl bg-slate-900 border border-slate-800 p-5">
              <div className={cn('inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3', k.bg)}>
                <Icon className={cn('h-5 w-5', k.color)} />
              </div>
              <p className="text-xl font-bold text-white truncate">{k.value}</p>
              <p className="text-sm text-slate-400 mt-0.5">{k.label}</p>
              {k.sub && <p className="text-xs text-slate-500 mt-1">{k.sub}</p>}
            </div>
          )
        })}
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-white">Doanh thu theo thời gian</h2>
          <div className="flex gap-1">
            {(['7d', '30d', '90d'] as Range[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  range === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                )}>
                {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : '3 tháng'}
              </button>
            ))}
          </div>
        </div>

        {revenueData.every(d => d.revenue === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <TrendingUp className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Chưa có doanh thu trong khoảng thời gian này</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={fmt}
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                formatter={(v: number) => [fmtFull(v), 'Doanh thu']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Bottom row: Pie + Top products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie chart */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="font-semibold text-white mb-6">Đơn hàng theo trạng thái</h2>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-sm">Chưa có dữ liệu</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.name] ?? '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }}
                  formatter={(v: number, name: string) => [v + ' đơn', name]}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
          <h2 className="font-semibold text-white mb-6">Top sản phẩm bán chạy</h2>
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Package className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Chưa có đơn nào được giao</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => {
                const maxRev = topProducts[0].revenue
                const pct    = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-sm text-white truncate max-w-[160px]">{p.name}</span>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className="text-sm font-medium text-white">{fmtFull(p.revenue)}</p>
                        <p className="text-xs text-slate-500">{p.qty} đã bán</p>
                      </div>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <StatsContent />
      </div>
    </Providers>
  )
}