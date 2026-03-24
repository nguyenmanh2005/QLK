"use client"

import { useState, useRef } from 'react'
import { Star, Upload, X, Loader2, SendHorizonal } from 'lucide-react'
import { reviewService, useAuth, type Review } from '@/components/providers'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  productId: number
  productName: string
  orderId: number
  onSuccess: (review: Review) => void
}

export function ReviewForm({ productId, productName, orderId, onSuccess }: ReviewFormProps) {
  const { user } = useAuth()
  const [rating, setRating]           = useState(0)
  const [hovered, setHovered]         = useState(0)
  const [title, setTitle]             = useState('')
  const [comment, setComment]         = useState('')
  const [imageFile, setImageFile]     = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async () => {
    if (rating === 0)     { toast.error('Vui lòng chọn số sao!'); return }
    if (!title.trim())    { toast.error('Vui lòng nhập tiêu đề!'); return }
    if (!comment.trim())  { toast.error('Vui lòng nhập bình luận!'); return }

    setLoading(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const res = await reviewService.uploadImage(imageFile)
        imageUrl  = res.imageUrl
      }

      const review = await reviewService.create({
        productId,
        userId:   parseInt(user!.id),
        userName: user!.name,
        orderId,
        title:    title.trim(),
        comment:  comment.trim(),
        rating,
        imageUrl,
      })

      toast.success('Đánh giá của bạn đã được gửi!')
      onSuccess(review)
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Gửi đánh giá thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const activeRating = hovered || rating
  const ratingLabels: Record<number, string> = {
    1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Xuất sắc',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="font-serif text-lg font-bold">Đánh giá sản phẩm</h3>
      <p className="mt-1 text-sm text-muted-foreground">{productName}</p>

      {/* Star Rating */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium">Chất lượng sản phẩm</p>
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
                s <= activeRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
              )} />
            </button>
          ))}
          {activeRating > 0 && (
            <span className="ml-2 text-sm font-medium text-amber-600">
              {ratingLabels[activeRating]}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium">Tiêu đề</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Tóm tắt cảm nhận của bạn..."
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Comment */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium">Bình luận</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Chia sẻ chi tiết trải nghiệm của bạn với sản phẩm này..."
          className="w-full resize-none rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
        />
        <p className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/2000</p>
      </div>

      {/* Image Upload */}
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium">
          Ảnh minh chứng
          <span className="ml-1 text-xs font-normal text-muted-foreground">(tuỳ chọn)</span>
        </label>
        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-24 w-24 rounded-lg object-cover border border-border"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs">Tải ảnh</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImage}
          className="hidden"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
          : <><SendHorizonal className="h-4 w-4" /> Gửi đánh giá</>
        }
      </button>
    </div>
  )
}