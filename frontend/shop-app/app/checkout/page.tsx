"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Package, MapPin, Phone, User, Loader2, CheckCircle2, QrCode, Banknote, AlertCircle } from 'lucide-react'
import { useCart, useAuth, orderService, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SELLER_API = 'http://localhost:5183'

const BANK_MAP: Record<string, string> = {
  '970415': 'VietinBank', '970436': 'Vietcombank', '970418': 'BIDV',
  '970405': 'Agribank',   '970422': 'MB Bank',      '970432': 'VPBank',
  '970423': 'Techcombank','970416': 'ACB',           '970403': 'Sacombank',
  '970433': 'HDBank',     '970448': 'OCB',           '970426': 'MSB',
}

interface QrInfo {
  sellerId: number
  sellerName: string
  qrStatus: string
  bankCode?: string
  accountNo?: string
  accountName?: string
}

interface ShippingForm {
  fullName: string
  phone: string
  address: string
  note: string
}

type PaymentMethod = 'cod' | 'qr'

function SellerQrPanel({ sellerIds, totalPrice }: { sellerIds: number[], totalPrice: number }) {
  const [qrMap, setQrMap]     = useState<Record<number, QrInfo>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!sellerIds.length) return
    const fetchAll = async () => {
      setLoading(true)
      try {
        const results = await Promise.all(
          sellerIds.map(async id => {
            try {
              const res = await fetch(`${SELLER_API}/api/seller/${id}/qr`)
              if (res.ok) return [id, await res.json()] as [number, QrInfo]
            } catch { }
            return [id, { sellerId: id, sellerName: `Shop #${id}`, qrStatus: 'None' }] as [number, QrInfo]
          })
        )
        setQrMap(Object.fromEntries(results))
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [sellerIds.join(',')])

  if (loading) return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )

  const noQrSellers      = sellerIds.filter(id => qrMap[id]?.qrStatus !== 'Approved')
  const approvedSellers  = sellerIds.filter(id => qrMap[id]?.qrStatus === 'Approved')

  return (
    <div className="space-y-4 mt-1">
      {noQrSellers.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="text-xs text-amber-700 dark:text-amber-400">
            <p className="font-medium">Một số shop chưa hỗ trợ QR:</p>
            <p className="mt-0.5">
              {noQrSellers.map(id => qrMap[id]?.sellerName ?? `Shop #${id}`).join(', ')} chưa đăng ký
              hoặc chưa được duyệt. Vui lòng chọn COD hoặc chỉ mua từ shop có hỗ trợ QR.
            </p>
          </div>
        </div>
      )}

      {approvedSellers.map(id => {
        const qr = qrMap[id]
        const qrUrl = `https://api.vietqr.io/image/${qr.bankCode}-${qr.accountNo}-compact2.jpg?amount=${totalPrice}&addInfo=DonHang${Date.now()}&accountName=${encodeURIComponent(qr.accountName ?? '')}`
        return (
          <div key={id} className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-3 text-sm font-medium">{qr.sellerName}</p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex-shrink-0 rounded-xl border border-border bg-white p-2 shadow-sm">
                <img
                  src={qrUrl}
                  alt={`QR ${qr.sellerName}`}
                  className="h-40 w-40 object-contain"
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${qr.accountNo}`
                  }}
                />
              </div>
              <div className="flex-1 space-y-2 text-sm">
                <p className="font-medium">Thông tin chuyển khoản</p>
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Ngân hàng</span>
                    <span className="font-medium">{BANK_MAP[qr.bankCode ?? ''] ?? qr.bankCode}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Số tài khoản</span>
                    <span className="font-mono font-medium tracking-wider">{qr.accountNo}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Chủ tài khoản</span>
                    <span className="font-medium uppercase">{qr.accountName}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Số tiền</span>
                    <span className="font-bold text-primary">{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  Đơn hàng xử lý sau khi xác nhận thanh toán (5–15 phút)
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckoutContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { items, totalItems, totalPrice, clearCart } = useCart()

  const [form, setForm]             = useState<ShippingForm>({ fullName: user?.name ?? '', phone: '', address: '', note: '' })
  const [paymentMethod, setPayment] = useState<PaymentMethod>('cod')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)
  const [errors, setErrors]         = useState<Partial<ShippingForm>>({})

  const sellerIds = [...new Set(items.map(i => parseInt(i.sellerId)).filter(id => !isNaN(id) && id > 0))]

  const validate = () => {
    const e: Partial<ShippingForm> = {}
    if (!form.fullName.trim()) e.fullName = 'Vui lòng nhập họ tên'
    if (!form.phone.trim())    e.phone    = 'Vui lòng nhập số điện thoại'
    else if (!/^0\d{9}$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.address.trim())  e.address  = 'Vui lòng nhập địa chỉ'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    if (!user) { router.push('/login'); return }
    setLoading(true)
    try {
      for (const item of items) {
        await orderService.create({
          userId:    parseInt(user.id),
          productId: parseInt(item.productId),
          quantity:  item.quantity,
        })
      }
      await clearCart()
      setSuccess(true)
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Đặt hàng thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="mt-6 font-serif text-2xl font-bold">Đặt hàng thành công!</h1>
        <p className="mt-2 text-muted-foreground">Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/orders" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all">
            Xem đơn hàng <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-secondary transition-colors">
            Tiếp tục mua sắm
          </Link>
        </div>
      </main>
    </div>
  )

  if (items.length === 0) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">Giỏ hàng trống, không thể thanh toán.</p>
        <Link href="/" className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Quay lại mua sắm
        </Link>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Quay lại giỏ hàng
          </Link>
          <h1 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">Thanh toán</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-lg font-bold">Thông tin giao hàng</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Họ và tên <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A"
                      className={cn("w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50", errors.fullName ? "border-destructive" : "border-border")} />
                  </div>
                  {errors.fullName && <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Số điện thoại <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567"
                      className={cn("w-full rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50", errors.phone ? "border-destructive" : "border-border")} />
                  </div>
                  {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Địa chỉ nhận hàng <span className="text-destructive">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" rows={3}
                      className={cn("w-full resize-none rounded-lg border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50", errors.address ? "border-destructive" : "border-border")} />
                  </div>
                  {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Ghi chú <span className="text-xs font-normal text-muted-foreground">(tuỳ chọn)</span></label>
                  <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Ghi chú cho người giao hàng..." rows={2}
                    className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <button type="button" onClick={() => setPayment('cod')}
                  className={cn("w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    paymentMethod === 'cod' ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                  <div className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2", paymentMethod === 'cod' ? "border-primary" : "border-muted-foreground/40")}>
                    {paymentMethod === 'cod' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <Banknote className={cn("h-5 w-5 flex-shrink-0", paymentMethod === 'cod' ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </button>

                <button type="button" onClick={() => setPayment('qr')}
                  className={cn("w-full flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
                    paymentMethod === 'qr' ? "border-primary bg-primary/5" : "border-border hover:border-primary/40")}>
                  <div className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2", paymentMethod === 'qr' ? "border-primary" : "border-muted-foreground/40")}>
                    {paymentMethod === 'qr' && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <QrCode className={cn("h-5 w-5 flex-shrink-0", paymentMethod === 'qr' ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className="text-sm font-medium">Chuyển khoản QR Code</p>
                    <p className="text-xs text-muted-foreground">Quét mã QR của từng shop để thanh toán</p>
                  </div>
                </button>

                {paymentMethod === 'qr' && (
                  <SellerQrPanel sellerIds={sellerIds} totalPrice={totalPrice} />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
              <h2 className="font-serif text-lg font-bold">Đơn hàng ({totalItems} sản phẩm)</h2>
              <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      {item.imageUrl ? (
                        <img src={item.imageUrl.startsWith('/') ? `http://localhost:5159${item.imageUrl}` : item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/40" /></div>
                      )}
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.price.toLocaleString('vi-VN')}đ / cái</p>
                    </div>
                    <p className="text-sm font-bold flex-shrink-0">{item.subtotal.toLocaleString('vi-VN')}đ</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Thanh toán</span>
                  <span className="font-medium">{paymentMethod === 'cod' ? 'COD' : 'QR Code'}</span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="font-medium">Tổng cộng</span>
                <span className="text-xl font-bold">{totalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý...</> : <>Đặt hàng ngay <ArrowRight className="h-4 w-4" /></>}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Bằng cách đặt hàng, bạn đồng ý với điều khoản dịch vụ của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Providers>
      <CheckoutContent />
    </Providers>
  )
}