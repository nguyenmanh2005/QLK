"use client"

import { useEffect, useState } from 'react'
import { Star, Package, UserCircle2 } from 'lucide-react'
import { reviewService, type Review } from '@/components/providers'
import { cn } from '@/lib/utils'

interface ReviewListProps {
  productId: number
  // Cho phép inject review mới từ bên ngoài sau khi submit form
  newReview?: Review | null
}

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={cn(
            size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5',
            s <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
          )}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 text-right text-xs text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-xs text-muted-foreground">{count}</span>
    </div>
  )
}

export function ReviewList({ productId, newReview }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reviewService.getByProduct(productId)
      .then((data: Review[]) => setReviews(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [productId])

  // Prepend review mới khi người dùng vừa submit
  useEffect(() => {
    if (newReview) setReviews(prev => [newReview, ...prev])
  }, [newReview])

  const total      = reviews.length
  const avgRating  = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0
  const countByStar = (star: number) => reviews.filter(r => r.rating === star).length

  if (loading) return (
    <div className="py-8 text-center text-sm text-muted-foreground">Đang tải đánh giá...</div>
  )

  return (
    <div className="space-y-6">
      {/* Summary */}
      {total > 0 && (
        <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 sm:flex-row">
          {/* Average score */}
          <div className="flex flex-col items-center justify-center sm:w-36">
            <span className="text-5xl font-bold">{avgRating.toFixed(1)}</span>
            <StarDisplay rating={Math.round(avgRating)} size="lg" />
            <span className="mt-1 text-sm text-muted-foreground">{total} đánh giá</span>
          </div>
          {/* Rating bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar
                key={s}
                label={`${s} sao`}
                count={countByStar(s)}
                total={total}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="mt-3 font-medium">Chưa có đánh giá nào</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        </div>
      )}

      {/* Review cards */}
      {reviews.map(review => (
        <article key={review.id} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted">
              <UserCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{review.userName}</span>
                <StarDisplay rating={review.rating} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                  })}
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold">{review.title}</p>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              {review.imageUrl && (
                <img
                  src={review.imageUrl.startsWith('/')
                    ? `http://localhost:5159${review.imageUrl}`
                    : review.imageUrl}
                  alt="Ảnh đánh giá"
                  className="mt-3 h-32 w-32 rounded-lg object-cover border border-border"
                />
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}