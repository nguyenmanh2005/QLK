import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { productService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader } from '../components/UI';
import toast from 'react-hot-toast';

const PRODUCT_API = 'http://localhost:5159';
const SELLER_API  = 'http://localhost:5183';

const ProductModal = ({ isOpen, onClose, onSaved, editProduct, sellers }) => {
  const isEdit = !!editProduct;
  const [form, setForm]       = useState({ name: '', description: '', price: '', stock: '', imageUrl: '', sellerId: '' });
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [uploading, setUploading] = useState(false);

  // FIX: sellerId phải là string để <select> hiện đúng option
  useEffect(() => {
    if (!isOpen) return;
    setImageMode('url');
    setForm(editProduct
      ? {
          name:        editProduct.name,
          description: editProduct.description || '',
          price:       editProduct.price,
          stock:       editProduct.stock,
          imageUrl:    editProduct.imageUrl || '',
          sellerId:    editProduct.sellerId != null ? String(editProduct.sellerId) : '',
        }
      : { name: '', description: '', price: '', stock: '', imageUrl: '', sellerId: '' }
    );
  }, [editProduct, isOpen]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${PRODUCT_API}/api/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Lỗi tải ảnh'); }
      const data = await res.json();
      setForm(f => ({ ...f, imageUrl: data.imageUrl }));
      toast.success('Tải ảnh lên thành công!');
    } catch (err) {
      toast.error(err.message || 'Tải ảnh thất bại!');
    } finally { setUploading(false); }
  };

  // FIX: parse sellerId an toàn, tránh NaN
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sellerIdValue = form.sellerId !== '' && form.sellerId != null
        ? parseInt(String(form.sellerId), 10)
        : null;

      const data = {
        name:        form.name,
        description: form.description,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock),
        imageUrl:    form.imageUrl || null,
        sellerId:    sellerIdValue !== null && !isNaN(sellerIdValue) ? sellerIdValue : null,
      };

      if (isEdit) await productService.update(editProduct.id, data);
      else        await productService.create(data);

      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  const previewSrc = form.imageUrl
    ? (form.imageUrl.startsWith('/') ? `${PRODUCT_API}${form.imageUrl}` : form.imageUrl)
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <form onSubmit={handleSubmit} className="space-y-4">

        <FormField label="Tên sản phẩm" required>
          <input className="input-field" placeholder="iPhone 15 Pro" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormField>

        <FormField label="Mô tả">
          <textarea className="input-field resize-none h-16" placeholder="Mô tả sản phẩm..."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </FormField>

        {/* Chọn Seller — dùng sellers được truyền từ props */}
        <FormField label="Người bán">
          <select className="input-field" value={form.sellerId}
            onChange={e => setForm(f => ({ ...f, sellerId: e.target.value }))}>
            <option value="">-- Chưa gán --</option>
            {sellers.map(s => (
              <option key={s.id} value={String(s.id)}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Hình ảnh">
          <div className="flex gap-2 mb-2">
            <button type="button" onClick={() => setImageMode('url')}
              className={`text-xs px-3 py-1.5 rounded-lg border ${imageMode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              Nhập URL
            </button>
            <button type="button" onClick={() => setImageMode('upload')}
              className={`text-xs px-3 py-1.5 rounded-lg border ${imageMode === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              Tải lên máy
            </button>
          </div>

          {imageMode === 'url' ? (
            <input className="input-field" placeholder="https://example.com/image.jpg"
              value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          ) : (
            <div>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
              {uploading && <p className="text-xs text-blue-600 mt-1">⏳ Đang tải lên...</p>}
            </div>
          )}

          {previewSrc && (
            <div className="mt-2 relative">
              <img src={previewSrc} alt="preview"
                className="h-28 w-full object-cover rounded-lg border border-gray-200"
                onError={e => e.target.style.display = 'none'} />
              <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                ✕
              </button>
            </div>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Giá (VNĐ)" required>
            <input type="number" min="0" className="input-field" placeholder="29000000" value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
          </FormField>
          <FormField label="Tồn kho" required>
            <input type="number" min="0" className="input-field" placeholder="100" value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required />
          </FormField>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="submit" disabled={loading || uploading} className="btn-primary">
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const ProductsPage = () => {
  const [products, setProducts]       = useState([]);
  const [sellers, setSellers]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [modal, setModal]             = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  // Load sellers 1 lần khi mount — dùng chung cho bảng và modal
  useEffect(() => {
    fetch(`${SELLER_API}/api/seller/list`)
      .then(r => r.json())
      .then(setSellers)
      .catch(() => {});
  }, []);

  const load = async () => {
    try { const res = await productService.getAll(); setProducts(res.data); }
    catch { toast.error('Không tải được danh sách!'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productService.delete(deleteId);
      toast.success('Xóa thành công!');
      setDeleteId(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại!'); }
    finally { setDeleting(false); }
  };

  // FIX: lấy tên seller từ sellers list thay vì hiện "Seller #id"
  const getSellerName = (sellerId) => {
    if (!sellerId) return '—';
    const seller = sellers.find(s => String(s.id) === String(sellerId));
    return seller ? seller.name : `Seller #${sellerId}`;
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Products ({products.length})</h1>
        <button onClick={() => { setEditProduct(null); setModal(true); }} className="btn-primary">
          <Plus size={16} /> Thêm sản phẩm
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm theo tên sản phẩm..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <DataTable
          headers={['#', 'Ảnh', 'Tên sản phẩm', 'Mô tả', 'Giá', 'Tồn kho', 'Người bán', 'Thao tác']}
          empty={filtered.length === 0 && <EmptyState icon={Search} title="Chưa có sản phẩm" desc="Thêm sản phẩm để bắt đầu" />}
        >
          {filtered.map((p, i) => {
            const imgSrc = p.imageUrl
              ? (p.imageUrl.startsWith('/') ? `${PRODUCT_API}${p.imageUrl}` : p.imageUrl)
              : null;
            return (
              <tr key={p.id} className="table-row">
                <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                <td className="py-3 px-4">
                  {imgSrc ? (
                    <img src={imgSrc} alt={p.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  ) : null}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center text-gray-400 text-xs"
                    style={{ display: imgSrc ? 'none' : 'flex' }}>
                    N/A
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
                <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{p.description || '—'}</td>
                <td className="py-3 px-4 font-medium">{parseFloat(p.price).toLocaleString('vi-VN')}đ</td>
                <td className="py-3 px-4">
                  <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.stock}
                  </span>
                </td>
                {/* FIX: hiện tên seller thay vì "Seller #id" */}
                <td className="py-3 px-4 text-gray-700 text-sm font-medium">
                  {getSellerName(p.sellerId)}
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditProduct(p); setModal(true); }}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setDeleteId(p.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {/* Truyền sellers xuống modal để dùng chung, không cần fetch lại */}
      <ProductModal
        isOpen={modal}
        onClose={() => setModal(false)}
        onSaved={load}
        editProduct={editProduct}
        sellers={sellers}
      />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa sản phẩm" message="Bạn có chắc muốn xóa sản phẩm này không?" />
    </div>
  );
};