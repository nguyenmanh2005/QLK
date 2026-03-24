"use client"

import { useState } from 'react'
import { Star, Loader2, SendHorizonal, Car } from 'lucide-react'
import { shipperReviewService, type ShipperReview } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShipperReviewFormProps {
  shipperId: number
  orderId: number
  onSuccess: (review: ShipperReview) => void
}

export function ShipperReviewForm({ shipperId, orderId, onSuccess }: ShipperReviewFormProps) {
  const [rating, setRating]           = useState(0)
  const [hovered, setHovered]         = useState(0)
  const [comment, setComment]         = useState('')
  const [loading, setLoading]         = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Vui lòng chọn số sao cho tài xế!'); return }

    setLoading(true)
    try {
      const review = await shipperReviewService.create({
        shipperId,
        orderId,
        comment: comment.trim(),
        rating,
      })

      toast.success('Đánh giá tài xế đã được gửi!')
      onSuccess(review)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Gửi đánh giá tài xế thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const activeRating = hovered || rating
  const ratingLabels: Record<number, string> = {
    1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời',
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6 mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Car className="h-5 w-5 text-blue-600" />
        <h3 className="font-serif text-lg font-bold text-blue-900">Đánh giá người giao hàng</h3>
      </div>
      <p className="mt-1 text-sm text-blue-700/80">Cảm nhận của bạn về tài xế giao đơn hàng này?</p>

      {/* Star Rating */}
      <div className="mt-5">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
            >
              <Star className={cn(
                "h-8 w-8 transition-colors",
                s <= activeRating ? "fill-amber-400 text-amber-400" : "text-blue-900/20"
              )} />
            </button>
          ))}
          {activeRating > 0 && (
            <span className="ml-2 text-sm font-medium text-blue-800">
              {ratingLabels[activeRating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium text-blue-900">Lời nhắn cho tài xế <span className="text-xs font-normal opacity-70">(Tuỳ chọn)</span></label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Tài xế thân thiện, giao hàng nhanh..."
          className="w-full resize-none rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
          : <><SendHorizonal className="h-4 w-4" /> Gửi đánh giá</>
        }
      </button>
    </div>
  )
}
