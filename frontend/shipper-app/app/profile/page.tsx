"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Truck, Edit2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { shipperService, useAuth, Providers } from '@/components/providers'

function ProfileContent() {
  const { shipper, isAuth, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [form, setForm] = useState({ name: '', phoneNumber: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [originalForm, setOriginalForm] = useState({ name: '', phoneNumber: '' })

  useEffect(() => {
    if (authLoading) return
    if (!isAuth || !shipper) {
      router.push('/login')
      return
    }

    shipperService.getById(shipper.id)
      .then((data) => {
        const loaded = {
          name: data?.name || '',
          phoneNumber: data?.phoneNumber || ''
        }
        setForm(loaded)
        setOriginalForm(loaded)
      })
      .catch(() => toast.error('Không tải được thông tin cá nhân'))
      .finally(() => setLoading(false))
      
  }, [shipper, isAuth, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await shipperService.updateProfile(form)
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 pt-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Link 
          href="/orders" 
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Về màn hình Đơn hàng
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-8 flex items-center justify-between border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Hồ sơ Tài xế</h1>
                <p className="text-sm text-slate-500">Giúp khách hàng liên hệ khi nhận hàng</p>
              </div>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Chỉnh sửa
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Tên Tài xế</label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{form.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500">Số Điện Thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    required
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="Bắt buộc"
                  />
                ) : (
                  <p className="text-base font-semibold text-slate-900">{form.phoneNumber || <span className="text-slate-400 italic">Chưa có số ĐT</span>}</p>
                )}
              </div>
              
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-500">Email Của Bạn</label>
                <p className="text-base font-semibold text-slate-900">{shipper?.email}</p>
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
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
