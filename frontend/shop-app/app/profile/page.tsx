"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, User as UserIcon, Edit2, Check, X, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { userService, useAuth, Providers } from '@/components/providers'

function ProfileContent() {
  const { user, isAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [form, setForm] = useState({ name: '', phoneNumber: '', latitude: null as number | null, longitude: null as number | null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Lưu tạm dể có thể Hủy
  const [originalForm, setOriginalForm] = useState({ name: '', phoneNumber: '', latitude: null as number | null, longitude: null as number | null })

  useEffect(() => {
    if (authLoading) return
    if (!isAuth || !user) {
      router.push('/login')
      return
    }

    userService.getById(Number(user.id))
      .then((data) => {
        const loaded = {
          name: data.name || '',
          phoneNumber: data.phoneNumber || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null
        }
        setForm(loaded)
        setOriginalForm(loaded)
      })
      .catch(() => toast.error('Không tải được thông tin cá nhân'))
      .finally(() => setLoading(false))
      
  }, [user, isAuth, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userService.updateProfile(form)
      toast.success('Cập nhật thông tin thành công!')
      setOriginalForm(form)
      setIsEditing(false)
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thất bại')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(originalForm)
    setIsEditing(false)
  }

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 pb-12 pt-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Link 
          href="/" 
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </Link>
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-10">
          <div className="mb-8 flex items-center justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hồ sơ của tôi</h1>
                <p className="text-sm text-muted-foreground">Quản lý nhận diện cá nhân</p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Họ và Tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <p className="text-base font-semibold">{form.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
                    placeholder="Chưa cập nhật"
                  />
                ) : (
                  <p className="text-base font-semibold">{form.phoneNumber || <span className="text-muted-foreground italic">Chưa có số ĐT</span>}</p>
                )}
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base font-semibold">{user?.email}</p>
              </div>

              {/* Tọa độ Geolocation */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">Vị trí giao hàng mặc định</label>
                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast.error('Trình duyệt không hỗ trợ vị trí')
                          return
                        }
                        toast.loading('Đang lấy vị trí...', { id: 'geo' })
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setForm({ ...form, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
                            toast.success('Đã lấy tọa độ!', { id: 'geo' })
                          },
                          () => toast.error('Vui lòng cấp quyền vị trí trong trình duyệt', { id: 'geo' })
                        )
                      }}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-50 text-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <MapPin className="h-4 w-4" />
                      Định vị trí của tôi
                    </button>
                    {form.latitude && form.longitude ? (
                      <span className="text-sm font-medium text-green-600">
                        {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Chưa có dữ liệu Bản đồ</span>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-semibold">
                    {form.latitude && form.longitude ? (
                      <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`} target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Đã thiết lập ({form.latitude.toFixed(4)}, {form.longitude.toFixed(4)})
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">Chưa thiết lập tọa độ giao hàng</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="pt-6 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                >
                  <X className="h-4 w-4" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Lưu Thay Đổi
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Providers>
      <ProfileContent />
    </Providers>
  )
}
