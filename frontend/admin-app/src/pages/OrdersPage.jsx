import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, RefreshCw } from 'lucide-react';
import { orderService, userService, productService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader, StatusBadge } from '../components/UI';
import { useGlobalLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

const CreateOrderModal = ({ isOpen, onClose, onSaved }) => {
  const [form, setForm]         = useState({ userId: '', productId: '', quantity: 1 });
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setForm({ userId: '', productId: '', quantity: 1 });
    const load = async () => {
      setLoadingData(true);
      try {
        const [u, p] = await Promise.all([userService.getAll(), productService.getAll()]);
        setUsers(u.data); setProducts(p.data);
      } catch { toast.error('Không tải được dữ liệu!'); }
      finally { setLoadingData(false); }
    };
    load();
  }, [isOpen]);

  const selectedProduct = products.find(p => p.id === parseInt(form.productId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.create({
        userId:    parseInt(form.userId),
        productId: parseInt(form.productId),
        quantity:  parseInt(form.quantity),
      });
      toast.success('Tạo order thành công!');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo Order mới">
      {loadingData ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Khách hàng" required>
            <select className="input-field" value={form.userId}
              onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} required>
              <option value="">-- Chọn user --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </FormField>
          <FormField label="Sản phẩm" required>
            <select className="input-field" value={form.productId}
              onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} required>
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {parseFloat(p.price).toLocaleString('vi-VN')}đ (còn {p.stock})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Số lượng" required>
            <input type="number" min="1" max={selectedProduct?.stock || 999} className="input-field"
              value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
          </FormField>
          {selectedProduct && form.quantity > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Thành tiền:</p>
              <p className="text-lg font-bold text-blue-700">
                {(parseFloat(selectedProduct.price) * parseInt(form.quantity || 0)).toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Đang tạo...' : 'Tạo Order'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

const StatusModal = ({ isOpen, onClose, onSaved, order }) => {
  const [status, setStatus]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (order) setStatus(order.status); }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await orderService.updateStatus(order.id, status);
      toast.success('Cập nhật trạng thái thành công!');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Cập nhật Order #${order?.id}`} size="sm">
      <form onSubmit={handleSubmit} className="space-y-3">
        {['Pending', 'Confirmed', 'Cancelled'].map(s => (
          <label key={s} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${
            status === s ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
            <StatusBadge status={s} />
          </label>
        ))}
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const OrdersPage = () => {
  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilter] = useState('');
  const [createModal, setCreateModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch { toast.error('Không tải được danh sách!'); }
    finally { setLoading(false); setGlobalLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    setGlobalLoading(true);
    try {
      await orderService.delete(deleteId);
      toast.success('Xóa thành công!');
      setDeleteId(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại!'); }
    finally { setDeleting(false); setGlobalLoading(false); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.id).includes(search);
    const matchStatus = !filterStatus || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Orders ({orders.length})</h1>
        <div className="flex gap-2">
          <button onClick={load} className="btn-secondary"><RefreshCw size={15} /> Làm mới</button>
          <button onClick={() => setCreateModal(true)} className="btn-primary"><Plus size={16} /> Tạo Order</button>
        </div>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Tìm theo ID, tên khách hàng, sản phẩm..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input-field w-44" value={filterStatus} onChange={e => setFilter(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <DataTable
          headers={['#', 'Khách hàng', 'Sản phẩm', 'SL', 'Tổng tiền', 'Trạng thái', 'Ngày tạo', '']}
          empty={filtered.length === 0 && <EmptyState icon={Search} title="Không có order nào" desc="Tạo order mới để bắt đầu" />}
        >
          {filtered.map(o => (
            <tr key={o.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">#{o.id}</td>
              <td className="py-3 px-4 text-gray-700">{o.user?.name || 'N/A'}</td>
              <td className="py-3 px-4 text-gray-700">{o.product?.name || 'N/A'}</td>
              <td className="py-3 px-4 text-gray-600 text-center">{o.quantity}</td>
              <td className="py-3 px-4 font-medium text-gray-900">{parseFloat(o.totalPrice).toLocaleString('vi-VN')}đ</td>
              <td className="py-3 px-4">
                <button onClick={() => { setSelectedOrder(o); setStatusModal(true); }} className="hover:opacity-70">
                  <StatusBadge status={o.status} />
                </button>
              </td>
              <td className="py-3 px-4 text-gray-500">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="py-3 px-4">
                <button onClick={() => setDeleteId(o.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <CreateOrderModal isOpen={createModal} onClose={() => setCreateModal(false)} onSaved={load} />
      <StatusModal isOpen={statusModal} onClose={() => setStatusModal(false)} onSaved={load} order={selectedOrder} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa Order" message="Bạn có chắc muốn xóa order này không?" />
    </div>
  );
};