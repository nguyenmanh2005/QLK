"use client"

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, Package, X } from 'lucide-react'
import { useRequireAuth, productService, Providers, PRODUCT_BASE, type Product } from '@/components/providers'
import { Sidebar } from '@/components/sidebar'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
// Đây là trang quản lý sản phẩm, nơi người bán có thể xem danh sách sản phẩm của mình, tạo mới, chỉnh sửa hoặc xóa sản phẩm.
function ProductModal({ isOpen, onClose, onSaved, editProduct }: { // 
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editProduct: Product | null 
})
 { // Đây là component modal dùng để tạo mới hoặc chỉnh sửa sản phẩm. 
 // Nếu editProduct có giá trị thì sẽ điền form để chỉnh sửa, nếu không thì sẽ để trống để tạo mới. 
 // Khi submit sẽ gọi API tương ứng và sau đó gọi onSaved để load lại danh sách sản phẩm, rồi đóng modal.
  const isEdit = !!editProduct
  const [form, setForm]           = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' })
  const [loading, setLoading]     = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const [uploading, setUploading] = useState(false)
// Khi mở modal, nếu có editProduct thì điền form, nếu không thì để trống
  useEffect(() => {
    if (!isOpen) return
    setImageMode('url')
    setForm(editProduct ? {
      name:        editProduct.name,
      description: editProduct.description || '',
      price:       String(editProduct.price),
      stock:       String(editProduct.stock),
      imageUrl:    editProduct.imageUrl || '',
    } : { name: '', description: '', price: '', stock: '', imageUrl: '' })
  }, [editProduct, isOpen])
// Hàm xử lý khi chọn file ảnh để upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await productService.uploadImage(file)
      setForm(f => ({ ...f, imageUrl: data.imageUrl }))
      toast.success('Tải ảnh thành công!')
    } catch {
      toast.error('Tải ảnh thất bại!')
    } finally {
      setUploading(false)
    }
  }
// Hàm xử lý khi submit form, nếu isEdit thì gọi API update, nếu không thì gọi API create
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        name:        form.name,
        description: form.description,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock),
        imageUrl:    form.imageUrl || undefined,
      }
      if (isEdit) await productService.update(editProduct!.id, data)
      else        await productService.create(data)
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!')
      onSaved(); onClose()
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Có lỗi xảy ra!')
    } finally {
      setLoading(false)
    }
  }
// Đây là phần hiển thị ảnh xem trước nếu đã có URL ảnh, và có nút để xóa ảnh nếu muốn thay đổi
  const previewSrc = form.imageUrl
    ? (form.imageUrl.startsWith('/') ? `${PRODUCT_BASE}${form.imageUrl}` : form.imageUrl)
    : null
// Nếu modal không mở thì không render gì cả
  if (!isOpen) return null
// Đây là phần giao diện của modal, bao gồm form nhập thông tin sản phẩm và các nút để lưu hoặc hủy
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Tên sản phẩm *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="iPhone 15 Pro"
              className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả sản phẩm..." rows={2}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Hình ảnh</label>
            <div className="flex gap-2 mb-2">
              {(['url', 'upload'] as const).map(mode => (
                <button key={mode} type="button" onClick={() => setImageMode(mode)}
                  className={cn("text-xs px-3 py-1.5 rounded-lg border transition-all",
                    imageMode === mode ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600"
                  )}>
                  {mode === 'url' ? 'Nhập URL' : 'Tải lên'}
                </button>
              ))}
            </div>
            {imageMode === 'url' ? (
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
            ) : (
              <div>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload}
                  className="block w-full text-sm text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 cursor-pointer" />
                {uploading && <p className="text-xs text-indigo-400 mt-1">⏳ Đang tải lên...</p>}
              </div>
            )}
            {previewSrc && (
              <div className="mt-2 relative">
                <img src={previewSrc} alt="preview" className="h-24 w-full object-cover rounded-xl border border-slate-700" />
                <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Giá (VNĐ) *</label>
              <input required type="number" min="0" value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="29000000"
                className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Tồn kho *</label>
              <input required type="number" min="0" value={form.stock}
                onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                placeholder="100"
                className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-all text-sm font-medium">
              Hủy
            </button>
            <button type="submit" disabled={loading || uploading}
              className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Đang lưu...</> : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductsContent() {
  const { isAuth, loading } = useRequireAuth()
  const [products, setProducts]       = useState<Product[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [modal, setModal]             = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId]       = useState<number | null>(null)
  const [deleting, setDeleting]       = useState(false)
  const [search, setSearch]           = useState('')

  const load = async () => {
    try {
      const data = await productService.getAll()
      setProducts(Array.isArray(data) ? data : data.data || [])
    } catch {
      toast.error('Không tải được sản phẩm!')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { if (isAuth) load() }, [isAuth])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await productService.delete(deleteId)
      toast.success('Xóa thành công!')
      setDeleteId(null); load()
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Xóa thất bại!')
    } finally {
      setDeleting(false)
    }
  }

  if (loading || loadingData) return (
    <div className="flex-1 flex items-center justify-center bg-slate-950">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex-1 bg-slate-950 p-8 overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sản phẩm của tôi</h1>
          <p className="text-slate-400 mt-1">{products.length} sản phẩm</p>
        </div>
        <button onClick={() => { setEditProduct(null); setModal(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all">
          <Plus className="h-4 w-4" /> Thêm sản phẩm
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="w-full max-w-sm h-11 rounded-xl bg-slate-900 border border-slate-800 px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm" />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800">
              {['#', 'Ảnh', 'Tên sản phẩm', 'Giá', 'Tồn kho', 'Thao tác'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : filtered.map((p, i) => {
              const imgSrc = p.imageUrl
                ? (p.imageUrl.startsWith('/') ? `${PRODUCT_BASE}${p.imageUrl}` : p.imageUrl)
                : null
              return (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 text-xs">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white text-sm">{p.name}</p>
                    {p.description && <p className="text-xs text-slate-400 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {parseFloat(String(p.price)).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full",
                      p.stock > 10 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditProduct(p); setModal(true) }}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      <ProductModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editProduct={editProduct} />

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Xóa sản phẩm</h3>
            <p className="text-slate-400 text-sm mb-6">Bạn có chắc muốn xóa sản phẩm này không?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all text-sm">
                Hủy
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Sidebar />
        <ProductsContent />
      </div>
    </Providers>
  )
}