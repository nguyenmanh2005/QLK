"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Truck, Star, Loader2, Phone, Calendar, ArrowLeft } from 'lucide-react'
import { shipperService, shipperReviewService, Providers } from '@/components/providers'
import { Navbar } from '@/components/navbar'
import { toast } from 'sonner'

interface ShipperProfile {
  id: number
  name: string
  email: string
  phoneNumber?: string
  createdAt: string
}

interface ShipperRating {
  shipperId: number
  averageRating: number
  totalReviews: number
}

function ShipperPageContent() {
  const router = useRouter()
  const params = useParams()
  const shipperId = parseInt(params.id as string)

  const [shipper, setShipper] = useState<ShipperProfile | null>(null)
  const [rating, setRating] = useState<ShipperRating | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shipperId) return

    Promise.all([
      shipperService.getById(shipperId),
      shipperReviewService.getRating(shipperId).catch(() => null)
    ])
      .then(([shipperData, ratingData]) => {
        setShipper(shipperData)
        setRating(ratingData)
      })
      .catch(() => toast.error('Không tải được thông tin tài xế!'))
      .finally(() => setLoading(false))
  }, [shipperId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Đang tải hồ sơ tài xế...</p>
      </div>
    )
  }

  if (!shipper) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-24 text-center">
          <Truck className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="text-2xl font-bold">Không tìm thấy tài xế</h1>
          <p className="mt-2 text-muted-foreground">Tài xế này không tồn tại hoặc đã bị ẩn.</p>
          <button onClick={() => router.back()} className="mt-6 inline-flex items-center gap-2 text-primary">
            <ArrowLeft className="h-4 w-4" /> Quay lại
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <button onClick={() => router.back()} className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
        </button>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 w-full relative">
            <div className="absolute -bottom-12 left-8 h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-card shadow-md">
              <Truck className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          
          <div className="pt-16 pb-8 px-8">
            <h1 className="text-3xl font-serif font-bold text-foreground">{shipper.name}</h1>
            
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                Tài xế đối tác
              </span>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-100/50 text-amber-600">
                  <Star className="h-5 w-5 fill-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Điểm tín nhiệm</p>
                  <p className="font-semibold text-foreground">
                    {rating && rating.totalReviews > 0 ? (
                      <>
                        <span className="text-lg">{rating.averageRating.toFixed(1)}</span>
                        <span className="text-sm font-normal text-muted-foreground"> / 5 ({rating.totalReviews} đánh giá)</span>
                      </>
                    ) : 'Chưa có'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100/50 text-blue-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Liên hệ</p>
                  <p className="font-semibold text-foreground">
                    {shipper.phoneNumber || 'Không khả dụng'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/50 border border-border/50 sm:col-span-2">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100/50 text-emerald-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                  <p className="font-semibold text-foreground">
                    {new Date(shipper.createdAt).toLocaleDateString('vi-VN', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
              Mọi thắc mắc về đơn hàng do tài xế này phụ trách, vui lòng liên hệ trực tiếp với tài xế hoặc gọi tổng đài hỗ trợ 1900-xxxx.
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ShipperPage() {
  return (
    <Providers>
      <ShipperPageContent />
    </Providers>
  )
}
