"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Store, Edit2, Check, X, MapPin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { sellerService, useAuth, Providers } from '@/components/providers'

function ProfileContent() {
  const { seller, isAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [form, setForm] = useState({ name: '', phoneNumber: '', latitude: null as number | null, longitude: null as number | null })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalForm, setOriginalForm] = useState({ name: '', phoneNumber: '', latitude: null as number | null, longitude: null as number | null })

  useEffect(() => {
    if (authLoading) return
    if (!isAuth || !seller) {
      router.push('/login')
      return
    }

    sellerService.getById(seller.id)
      .then((data) => {
        const loaded = {
          name: data?.name || '',
          phoneNumber: data?.phoneNumber || '',
          latitude: data?.latitude || null,
          longitude: data?.longitude || null
        }
        setForm(loaded)
        setOriginalForm(loaded)
      })
      .catch(() => toast.error('Không tải được thông tin cá nhân'))
      .finally(() => setLoading(false))
      
  }, [seller, isAuth, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await sellerService.updateProfile(form)
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
    <div className="min-h-screen bg-slate-50 pb-12 pt-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Link 
          href="/dashboard" 
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Dashboard
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 flex items-center justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Store className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ Cửa hàng</h1>
                <p className="text-sm text-slate-500">Thông tin nhận diện với khách hàng</p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Tên Chủ Shop</label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{form.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Hotline</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Chưa cập nhật"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{form.phoneNumber || <span className="text-slate-400 italic">Chưa có số ĐT</span>}</p>
                )}
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-500">Email Cửa Hàng</label>
                <p className="text-base font-semibold text-slate-900">{seller?.email}</p>
              </div>

              {/* Tọa độ Geolocation */}
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-500">Vị trí Kho hàng (Dùng để Ship)</label>
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
                            toast.success('Đã lấy tọa độ Kho hàng!', { id: 'geo' })
                          },
                          () => toast.error('Vui lòng cấp quyền vị trí trong trình duyệt', { id: 'geo' })
                        )
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 text-indigo-700 px-4 py-2 text-sm font-medium hover:bg-indigo-100 transition-colors border border-indigo-200"
                    >
                      <MapPin className="h-4 w-4" />
                      Lấy tọa độ Kho hàng hiện tại
                    </button>
                    {form.latitude && form.longitude ? (
                      <span className="text-sm font-medium text-emerald-600">
                        {form.latitude.toFixed(5)}, {form.longitude.toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Chưa có dữ liệu Bản đồ</span>
                    )}
                  </div>
                ) : (
                  <p className="text-base font-semibold">
                    {form.latitude && form.longitude ? (
                      <a href={`https://www.google.com/maps?q=${form.latitude},${form.longitude}`} target="_blank" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" /> Đã thiết lập vị trí Kho
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Chưa thiết lập tọa độ Kho hàng</span>
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
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="h-4 w-4" /> Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
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
