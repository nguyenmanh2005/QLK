import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Truck } from 'lucide-react';
import { shipperService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader } from '../components/UI';
import { useGlobalLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

const ShipperModal = ({ isOpen, onClose, onSaved, editShipper }) => {
  const isEdit = !!editShipper;
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editShipper
      ? { name: editShipper.name, email: editShipper.email, password: '' }
      : { name: '', email: '', password: '' }
    );
  }, [editShipper, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const data = { name: form.name, email: form.email };
        if (form.password) data.password = form.password;
        await shipperService.update(editShipper.id, data);
        toast.success('Cập nhật thành công!');
      } else {
        await shipperService.create({ name: form.name, email: form.email, password: form.password });
        toast.success('Tạo shipper thành công!');
      }
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Sửa Shipper' : 'Thêm Shipper'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Họ tên" required>
          <input className="input-field" placeholder="Nguyễn Văn A" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormField>
        <FormField label="Email" required>
          <input type="email" className="input-field" placeholder="shipper@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </FormField>
        <FormField label={isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} required={!isEdit}>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form.password} required={!isEdit}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </FormField>
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

export const ShippersPage = () => {
  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const [shippers, setShippers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modal, setModal]         = useState(false);
  const [editShipper, setEditShipper] = useState(null);
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);

  const load = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const res = await shipperService.getAll();
      setShippers(res.data);
    } catch { toast.error('Không tải được danh sách!'); }
    finally { setLoading(false); setGlobalLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    setGlobalLoading(true);
    try {
      await shipperService.delete(deleteId);
      toast.success('Xóa thành công!');
      setDeleteId(null); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại!');
    } finally { setDeleting(false); setGlobalLoading(false); }
  };

  const filtered = shippers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Shippers ({shippers.length})</h1>
        <button onClick={() => { setEditShipper(null); setModal(true); }} className="btn-primary">
          <Plus size={16} /> Thêm Shipper
        </button>
      </div>
      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm theo tên hoặc email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable
          headers={['#', 'Họ tên', 'Email', 'Ngày tạo', 'Thao tác']}
          empty={filtered.length === 0 &&
            <EmptyState icon={Truck} title="Không có shipper nào" desc="Thêm shipper để bắt đầu" />}
        >
          {filtered.map((shipper, i) => (
            <tr key={shipper.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">{i + 1}</td>
              <td className="py-3 px-4 font-medium text-gray-900">{shipper.name}</td>
              <td className="py-3 px-4 text-gray-600">{shipper.email}</td>
              <td className="py-3 px-4 text-gray-500">{new Date(shipper.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button onClick={() => { setEditShipper(shipper); setModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(shipper.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
      <ShipperModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editShipper={editShipper} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa Shipper" message="Bạn có chắc muốn xóa shipper này không?" />
    </div>
  );
};