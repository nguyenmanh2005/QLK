import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { userService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader } from '../components/UI';
import toast from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, onSaved, editUser }) => {
  const isEdit = !!editUser;
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(editUser ? { name: editUser.name, email: editUser.email, password: '' } : { name: '', email: '', password: '' });
  }, [editUser, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) await userService.update(editUser.id, { name: form.name, email: form.email });
      else await userService.create(form);
      toast.success(isEdit ? 'Cập nhật thành công!' : 'Tạo user thành công!');
      onSaved(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Sửa User' : 'Thêm User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Họ tên" required>
          <input className="input-field" placeholder="Nguyễn Văn A" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </FormField>
        <FormField label="Email" required>
          <input type="email" className="input-field" placeholder="user@example.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </FormField>
        {!isEdit && (
          <FormField label="Mật khẩu" required>
            <input type="password" className="input-field" placeholder="Ít nhất 6 ký tự" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </FormField>
        )}
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

export const UsersPage = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try { const res = await userService.getAll(); setUsers(res.data); }
    catch { toast.error('Không tải được danh sách!'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.delete(deleteId);
      toast.success('Xóa thành công!');
      setDeleteId(null); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại!'); }
    finally { setDeleting(false); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Users ({users.length})</h1>
        <button onClick={() => { setEditUser(null); setModal(true); }} className="btn-primary">
          <Plus size={16} /> Thêm User
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
          empty={filtered.length === 0 && <EmptyState icon={Search} title="Không có user nào" desc="Thử tìm kiếm khác hoặc thêm mới" />}
        >
          {filtered.map((user, i) => (
            <tr key={user.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">{i + 1}</td>
              <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
              <td className="py-3 px-4 text-gray-600">{user.email}</td>
              <td className="py-3 px-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button onClick={() => { setEditUser(user); setModal(true); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      <UserModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editUser={editUser} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa User" message="Bạn có chắc muốn xóa user này không?" />
    </div>
  );
};
