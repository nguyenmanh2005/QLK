"use client"

import { useState, useEffect } from 'react'
import {
  QrCode, Building2, CreditCard, User, Loader2,
  CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw
} from 'lucide-react'
import { useRequireAuth, qrService, Providers } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const BANKS = [
  { code: '970415', name: 'VietinBank' },
  { code: '970436', name: 'Vietcombank' },
  { code: '970418', name: 'BIDV' },
  { code: '970405', name: 'Agribank' },
  { code: '970422', name: 'MB Bank' },
  { code: '970432', name: 'VPBank' },
  { code: '970423', name: 'Techcombank' },
  { code: '970416', name: 'ACB' },
  { code: '970403', name: 'Sacombank' },
  { code: '970433', name: 'HDBank' },
  { code: '970448', name: 'OCB' },
  { code: '970426', name: 'MSB' },
]

interface QrStatus {
  qrStatus: string
  bankCode?: string
  accountNo?: string
  accountName?: string
  rejectedReason?: string
  submittedAt?: string
  approvedAt?: string
  vietQrUrl?: string
}

function QrContent() {
  const { isAuth, loading } = useRequireAuth()
  const [status, setStatus]   = useState<QrStatus | null>(null)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState({ bankCode: '', accountNo: '', accountName: '' })

  const fetchStatus = async () => {
    setFetching(true)
    try {
      const data = await qrService.getStatus()
      if (data) setStatus(data)
    } catch { }
    finally { setFetching(false) }
  }

  useEffect(() => {
    if (!loading && isAuth) fetchStatus()
  }, [isAuth, loading])

  // Điền sẵn form nếu đang Rejected
  useEffect(() => {
    if (status?.qrStatus === 'Rejected' && status.bankCode) {
      setForm({
        bankCode:    status.bankCode ?? '',
        accountNo:   status.accountNo ?? '',
        accountName: status.accountName ?? '',
      })
    }
  }, [status])

  const handleSubmit = async () => {
    if (!form.bankCode || !form.accountNo.trim() || !form.accountName.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setSaving(true)
    try {
      const res = await qrService.register(form)
      toast.success(res?.message ?? 'Gửi đơn thành công!')
      await fetchStatus()
    } catch (e: unknown) {
      toast.error((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading || fetching) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thanh toán QR</h1>
          <p className="text-slate-400 mt-1">Đăng ký tài khoản ngân hàng để nhận thanh toán QR từ khách</p>
        </div>
        <button onClick={fetchStatus} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <RefreshCw className="h-4 w-4" /> Làm mới
        </button>
      </div>

      <div className="max-w-xl">
        {/* ─── Đã được duyệt ─── */}
        {status?.qrStatus === 'Approved' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Thông tin QR</h2>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Đã duyệt
              </span>
            </div>

            <div className="flex flex-col gap-5 sm:flex-row">
              <img
                src={`https://api.vietqr.io/image/${status.bankCode}-${status.accountNo}-compact2.jpg?accountName=${encodeURIComponent(status.accountName ?? '')}`}
                alt="QR"
                className="h-40 w-40 rounded-xl border border-slate-700 bg-white object-contain p-2 flex-shrink-0"
              />
              <div className="space-y-3 text-sm flex-1">
                {[
                  { label: 'Ngân hàng',      value: BANKS.find(b => b.code === status.bankCode)?.name ?? status.bankCode },
                  { label: 'Số tài khoản',   value: status.accountNo },
                  { label: 'Chủ tài khoản',  value: status.accountName },
                  { label: 'Ngày duyệt',     value: status.approvedAt ? new Date(status.approvedAt).toLocaleDateString('vi-VN') : '' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Mã QR này sẽ tự động hiển thị cho khách khi thanh toán tất cả sản phẩm của bạn. Để thay đổi, vui lòng liên hệ admin.
            </p>
          </div>
        )}

        {/* ─── Đang chờ duyệt ─── */}
        {status?.qrStatus === 'Pending' && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Đơn đăng ký QR</h2>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                <Clock className="h-3.5 w-3.5" /> Chờ duyệt
              </span>
            </div>

            <div className="rounded-xl bg-yellow-500/5 border border-yellow-500/10 p-4 text-sm text-yellow-300 mb-4">
              Đơn đăng ký QR của bạn đang chờ admin phê duyệt. Thường mất 1–2 ngày làm việc.
            </div>

            <div className="space-y-2 text-sm">
              {[
                { label: 'Ngân hàng',     value: BANKS.find(b => b.code === status.bankCode)?.name ?? status.bankCode },
                { label: 'Số tài khoản', value: status.accountNo },
                { label: 'Chủ tài khoản', value: status.accountName },
                { label: 'Nộp lúc',      value: status.submittedAt ? new Date(status.submittedAt).toLocaleDateString('vi-VN') : '' },
              ].map(row => (
                <div key={row.label} className="flex justify-between border-b border-slate-800 pb-2 last:border-0">
                  <span className="text-slate-400">{row.label}</span>
                  <span className="text-slate-200">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Form đăng ký (None hoặc Rejected) ─── */}
        {(status?.qrStatus === 'None' || status?.qrStatus === 'Rejected' || !status?.qrStatus) && (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-indigo-400" />
                <h2 className="font-semibold text-white">Đăng ký QR thanh toán</h2>
              </div>
              {status?.qrStatus === 'Rejected' && (
                <span className="flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                  <XCircle className="h-3.5 w-3.5" /> Bị từ chối
                </span>
              )}
            </div>

            {status?.qrStatus === 'Rejected' && (
              <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-500/5 border border-red-500/10 p-4 text-sm text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Lý do từ chối:</p>
                  <p className="text-red-400">{status.rejectedReason}</p>
                  <p className="mt-2 text-xs text-slate-500">Hãy cập nhật lại thông tin và nộp đơn mới.</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Bank */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ngân hàng <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={form.bankCode}
                    onChange={e => setForm(f => ({ ...f, bankCode: e.target.value }))}
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-800">-- Chọn ngân hàng --</option>
                    {BANKS.map(b => (
                      <option key={b.code} value={b.code} className="bg-slate-800">{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Account No */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Số tài khoản <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.accountNo}
                    onChange={e => setForm(f => ({ ...f, accountNo: e.target.value }))}
                    placeholder="VD: 0123456789"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Account Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tên chủ tài khoản <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.accountName}
                    onChange={e => setForm(f => ({ ...f, accountName: e.target.value.toUpperCase() }))}
                    placeholder="VD: NGUYEN VAN A"
                    className="w-full h-12 rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all uppercase"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Nhập không dấu, chữ in hoa — đúng với tên tài khoản ngân hàng</p>
              </div>

              {/* Preview QR */}
              {form.bankCode && form.accountNo && (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm font-medium text-slate-300 mb-3">Xem trước mã QR</p>
                  <div className="flex items-center gap-4">
                    <img
                      src={`https://api.vietqr.io/image/${form.bankCode}-${form.accountNo}-compact2.jpg?accountName=${encodeURIComponent(form.accountName)}`}
                      alt="Preview QR"
                      className="h-28 w-28 rounded-lg border border-slate-700 bg-white object-contain p-1.5 flex-shrink-0"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                    <div className="space-y-1 text-xs text-slate-400">
                      <p>{BANKS.find(b => b.code === form.bankCode)?.name}</p>
                      <p>{form.accountNo}</p>
                      <p>{form.accountName}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
                  : 'Gửi đơn đăng ký QR'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function QrPage() {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <QrContent />
      </div>
    </Providers>
  )
}