import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { productService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader } from '../components/UI';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, onSaved, editProduct }) => {
  const isEdit = !!editProduct;
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editProduct
      ? {
          name:        editProduct.name,
          description: editProduct.description || '',
          price:       editProduct.price,
          stock:       editProduct.stock,
          imageUrl:    editProduct.imageUrl || ''
        }
      : { name: '', description: '', price: '', stock: '', imageUrl: '' }
    );
  }, [editProduct, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name:        form.name,
        description: form.description,
        price:       parseFloat(form.price),
        stock:       parseInt(form.stock),
        imageUrl:    form.imageUrl || null
      };
      if (isEdit) await productService.update(editProduct.id, data);
      else await productService.create(data);
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Tên sản phẩm" required>
          <input className="input-field" placeholder="iPhone 15 Pro" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormField>

        <FormField label="Mô tả">
          <textarea className="input-field resize-none h-16" placeholder="Mô tả..." value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </FormField>

        <FormField label="URL Hình ảnh">
          <input className="input-field" placeholder="https://example.com/image.jpg" value={form.imageUrl}
            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
          {/* Preview ảnh nếu có URL */}
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview"
              className="mt-2 h-24 w-full object-cover rounded-lg border border-gray-200"
              onError={e => e.target.style.display = 'none'} />
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
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
          headers={['#', 'Ảnh', 'Tên sản phẩm', 'Mô tả', 'Giá', 'Tồn kho', 'Thao tác']}
          empty={filtered.length === 0 && <EmptyState icon={Search} title="Chưa có sản phẩm" desc="Thêm sản phẩm để bắt đầu" />}
        >
          {filtered.map((p, i) => (
            <tr key={p.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">{i + 1}</td>
              <td className="py-3 px-4">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name}
                    className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                    onError={e => e.target.style.display = 'none'} />
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                    N/A
                  </div>
                )}
              </td>
              <td className="py-3 px-4 font-medium text-gray-900">{p.name}</td>
              <td className="py-3 px-4 text-gray-500 max-w-xs truncate">{p.description || '—'}</td>
              <td className="py-3 px-4 font-medium text-gray-900">{parseFloat(p.price).toLocaleString('vi-VN')}đ</td>
              <td className="py-3 px-4">
                <span className={`badge ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.stock}
                </span>
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
          ))}
        </DataTable>
      </div>

      <ProductModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editProduct={editProduct} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa sản phẩm" message="Bạn có chắc muốn xóa sản phẩm này không?" />
    </div>
  );
};