import { useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Tag, ImagePlus, GripVertical } from 'lucide-react';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader, Spinner } from '../components/UI';
import { useGlobalLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

const PRODUCT_API = 'http://localhost:5159'; // ← đổi port ProductService của bạn

const CategoryModal = ({ isOpen, onClose, onSaved, editCategory }) => {
  const isEdit = !!editCategory
  const [form, setForm]         = useState({ name: '', description: '', imageUrl: '', sortOrder: 0 })
  const [loading, setLoading]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]   = useState(null)
  const fileRef = useRef()

  useEffect(() => {
    if (!isOpen) return
    if (editCategory) {
      setForm({
        name:        editCategory.name        ?? '',
        description: editCategory.description ?? '',
        imageUrl:    editCategory.imageUrl    ?? '',
        sortOrder:   editCategory.sortOrder   ?? 0,
      })
      setPreview(editCategory.imageUrl || null)
    } else {
      setForm({ name: '', description: '', imageUrl: '', sortOrder: 0 })
      setPreview(null)
    }
  }, [editCategory, isOpen])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview ngay
    setPreview(URL.createObjectURL(file))

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${PRODUCT_API}/api/categories/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      if (!res.ok) throw new Error('Upload thất bại')
      const { url } = await res.json()
      setForm(f => ({ ...f, imageUrl: url }))
      toast.success('Upload ảnh thành công!')
    } catch (err) {
      toast.error(err.message)
      setPreview(form.imageUrl || null)
    } finally { setUploading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên danh mục'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const url    = isEdit
        ? `${PRODUCT_API}/api/categories/${editCategory.id}`
        : `${PRODUCT_API}/api/categories`
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name:        form.name.trim(),
          description: form.description.trim() || null,
          imageUrl:    form.imageUrl || null,
          sortOrder:   Number(form.sortOrder) || 0,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        throw new Error(err || 'Có lỗi xảy ra')
      }
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo danh mục thành công!')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? `Sửa: ${editCategory?.name}` : 'Thêm danh mục'}
      size="md">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Ảnh */}
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0 transition-colors">
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Spinner className="w-5 h-5" />
              </div>
            )}
            {preview
              ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
              : <div className="flex flex-col items-center text-gray-400 gap-1">
                  <ImagePlus size={22} />
                  <span className="text-xs">Tải ảnh</span>
                </div>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-gray-700">Ảnh đại diện</p>
            <p className="text-xs text-gray-400">Click vào ô bên trái để upload (jpg, png, webp · tối đa 5MB)</p>
            <p className="text-xs text-gray-400">Hoặc nhập URL trực tiếp:</p>
            <input type="text" className="input-field text-xs" placeholder="https://..."
              value={form.imageUrl}
              onChange={e => {
                setForm(f => ({ ...f, imageUrl: e.target.value }))
                setPreview(e.target.value || null)
              }} />
          </div>
        </div>

        <FormField label="Tên danh mục" required>
          <input className="input-field" placeholder="Ví dụ: Điện thoại, Thời trang..."
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormField>

        <FormField label="Mô tả">
          <textarea className="input-field resize-none h-20"
            placeholder="Mô tả ngắn về danh mục..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </FormField>

        <FormField label="Thứ tự hiển thị">
          <input type="number" min={0} className="input-field w-32"
            value={form.sortOrder}
            onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
          <p className="text-xs text-gray-400 mt-1">Số nhỏ hơn hiển thị trước</p>
        </FormField>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="submit" disabled={loading || uploading} className="btn-primary">
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export const CategoriesPage = () => {
  const { setLoading: setGlobalLoading } = useGlobalLoading()
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(false)
  const [editCategory, setEdit]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const load = async () => {
    setLoading(true)
    setGlobalLoading(true)
    try {
      const res = await fetch(`${PRODUCT_API}/api/categories`)
      if (!res.ok) throw new Error()
      setCategories(await res.json())
    } catch {
      toast.error('Không tải được danh mục!')
    } finally {
      setLoading(false)
      setGlobalLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    setDeleting(true)
    setGlobalLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${PRODUCT_API}/api/categories/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.success('Xóa thành công!')
      setDeleteId(null)
      load()
    } catch {
      toast.error('Xóa thất bại!')
    } finally {
      setDeleting(false)
      setGlobalLoading(false)
    }
  }

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Danh mục sản phẩm ({categories.length})</h1>
        <button onClick={() => { setEdit(null); setModal(true) }} className="btn-primary">
          <Plus size={16} /> Thêm danh mục
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm theo tên hoặc mô tả..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <DataTable
          headers={['#', 'Ảnh', 'Tên danh mục', 'Mô tả', 'Thứ tự', 'Ngày tạo', 'Thao tác']}
          empty={filtered.length === 0 &&
            <EmptyState icon={Tag} title="Không có danh mục nào" desc="Thêm danh mục để bắt đầu" />}
        >
          {filtered.map((cat, i) => (
            <tr key={cat.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">{i + 1}</td>
              <td className="py-3 px-4">
                {cat.imageUrl
                  ? <img src={cat.imageUrl.startsWith('http') ? cat.imageUrl : `${PRODUCT_API}${cat.imageUrl}`}
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 bg-gray-50" />
                  : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Tag size={16} className="text-gray-400" />
                    </div>
                }
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{cat.name}</td>
              <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <GripVertical size={12} /> {cat.sortOrder}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-500">
                {new Date(cat.createdAt).toLocaleDateString('vi-VN')}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button onClick={() => { setEdit(cat); setModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(cat.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <CategoryModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editCategory={editCategory} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa danh mục" message="Bạn có chắc muốn xóa danh mục này không?" />
    </div>
  )
}