import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Store, QrCode, CheckCircle2, XCircle, Clock, Building2, CreditCard, User } from 'lucide-react';
import { sellerService, qrService } from '../services/api';
import { Modal, FormField, ConfirmDialog, DataTable, EmptyState, PageLoader, Spinner } from '../components/UI';
import { useGlobalLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

const SELLER_API = 'http://localhost:5183';

const BANKS = [
  { code: '970415', name: 'VietinBank' },
  { code: '970436', name: 'Vietcombank' },
  { code: '970418', name: 'BIDV' },
  { code: '970405', name: 'Agribank' },
  { code: '970422', name: 'MB Bank' },
  { code: '970432', name: 'VPBank' },
  { code: '970423', name: 'Techcombank' },
  { code: '970416', name: 'ACB' },
  { code: '970403', name: 'Sacombank' },
  { code: '970433', name: 'HDBank' },
  { code: '970448', name: 'OCB' },
  { code: '970426', name: 'MSB' },
];

const BANK_MAP = Object.fromEntries(BANKS.map(b => [b.code, b.name]));

const QrStatusBadge = ({ status }) => {
  const map = {
    Approved: 'bg-green-100 text-green-700',
    Pending:  'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
    None:     'bg-gray-100 text-gray-500',
  };
  const icons = {
    Approved: <CheckCircle2 size={11} />,
    Pending:  <Clock size={11} />,
    Rejected: <XCircle size={11} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.None}`}>
      {icons[status]}
      {status || 'None'}
    </span>
  );
};

// ─── Tab QR trong modal seller ────────────────────────────
const SellerQrTab = ({ seller, onUpdated }) => {
  const [qr, setQr]               = useState(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [rejectReason, setReject] = useState('')
  const [editMode, setEditMode]   = useState(false)
  const [form, setForm]           = useState({ bankCode: '', accountNo: '', accountName: '' })

  useEffect(() => {
    if (!seller) return
    fetchQr()
  }, [seller?.id])

  const fetchQr = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${SELLER_API}/api/seller/${seller.id}/qr`)
      if (res.ok) {
        const data = await res.json()
        setQr(data)
        setForm({
          bankCode:    data.bankCode    ?? '',
          accountNo:   data.accountNo   ?? '',
          accountName: data.accountName ?? '',
        })
      }
    } catch { }
    finally { setLoading(false) }
  }

  const handleReview = async (approved) => {
    if (!approved && !rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    setSaving(true)
    try {
      await qrService.review(seller.id, approved, approved ? undefined : rejectReason)
      toast.success(approved ? 'Đã phê duyệt!' : 'Đã từ chối!')
      await fetchQr()
      onUpdated?.()
    } catch (err) {
      toast.error(err.message || 'Có lỗi xảy ra!')
    } finally { setSaving(false) }
  }

  const handleUpdateQr = async () => {
    if (!form.bankCode || !form.accountNo.trim() || !form.accountName.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      // ✅ URL đúng khớp với backend: PUT /api/seller/{id}/qr/admin-update
      const res = await fetch(`${SELLER_API}/api/seller/${seller.id}/qr/admin-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bankCode:    form.bankCode,
          accountNo:   form.accountNo,
          accountName: form.accountName,
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || 'Cập nhật thất bại')
      }
      toast.success('Đã cập nhật và phê duyệt QR!')
      setEditMode(false)
      await fetchQr()
      onUpdated?.()
    } catch (err) {
      toast.error(err.message)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>

  const hasQr = qr?.qrStatus && qr.qrStatus !== 'None'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Trạng thái:</span>
          <QrStatusBadge status={qr?.qrStatus || 'None'} />
        </div>
        {hasQr && !editMode && (
          <button onClick={() => setEditMode(true)}
            className="text-xs text-blue-600 hover:underline flex items-center gap-1">
            <Pencil size={12} /> Sửa thông tin
          </button>
        )}
      </div>

      {!hasQr && !editMode && (
        <div className="flex flex-col items-center py-8 text-center">
          <QrCode size={36} className="text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Seller chưa đăng ký QR</p>
          <button onClick={() => setEditMode(true)} className="mt-3 btn-primary text-xs">
            <Plus size={13} /> Thêm QR cho seller
          </button>
        </div>
      )}

      {editMode && (
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-medium text-blue-700">Cập nhật thông tin QR</p>

          <FormField label="Ngân hàng" required>
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={form.bankCode}
                onChange={e => setForm(f => ({ ...f, bankCode: e.target.value }))}
                className="input-field pl-9">
                <option value="">-- Chọn ngân hàng --</option>
                {BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>
          </FormField>

          <FormField label="Số tài khoản" required>
            <div className="relative">
              <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.accountNo}
                onChange={e => setForm(f => ({ ...f, accountNo: e.target.value }))}
                placeholder="0123456789" className="input-field pl-9" />
            </div>
          </FormField>

          <FormField label="Tên chủ tài khoản" required>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={form.accountName}
                onChange={e => setForm(f => ({ ...f, accountName: e.target.value.toUpperCase() }))}
                placeholder="NGUYEN VAN A" className="input-field pl-9 uppercase" />
            </div>
          </FormField>

          {form.bankCode && form.accountNo && (
            <div className="flex items-center gap-3 mt-1">
              <img
                src={`https://api.vietqr.io/image/${form.bankCode}-${form.accountNo}-compact2.jpg?accountName=${encodeURIComponent(form.accountName)}`}
                alt="preview"
                className="h-20 w-20 rounded-lg border border-gray-200 bg-white object-contain p-1"
                onError={e => { e.target.style.display = 'none' }}
              />
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>{BANK_MAP[form.bankCode] || form.bankCode}</p>
                <p>{form.accountNo}</p>
                <p>{form.accountName}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={() => setEditMode(false)} className="btn-secondary text-xs">Hủy</button>
            <button onClick={handleUpdateQr} disabled={saving}
              className="btn-primary text-xs flex items-center gap-1">
              {saving && <Spinner className="w-3 h-3" />}
              Lưu & Phê duyệt
            </button>
          </div>
        </div>
      )}

      {hasQr && !editMode && (
        <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <img
            src={`https://api.vietqr.io/image/${qr.bankCode}-${qr.accountNo}-compact2.jpg?accountName=${encodeURIComponent(qr.accountName ?? '')}`}
            alt="QR"
            className="h-28 w-28 rounded-lg border border-gray-200 bg-white object-contain p-1 flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
          <div className="space-y-2 text-sm flex-1">
            {[
              { label: 'Ngân hàng',      value: BANK_MAP[qr.bankCode] || qr.bankCode },
              { label: 'Số tài khoản',  value: qr.accountNo },
              { label: 'Chủ tài khoản', value: qr.accountName },
              { label: 'Nộp lúc',       value: qr.submittedAt ? new Date(qr.submittedAt).toLocaleDateString('vi-VN') : '—' },
              { label: 'Duyệt lúc',     value: qr.approvedAt  ? new Date(qr.approvedAt).toLocaleDateString('vi-VN')  : '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                <span className="text-gray-500">{row.label}</span>
                <span className="font-medium text-gray-800">{row.value}</span>
              </div>
            ))}
            {qr.qrStatus === 'Rejected' && qr.rejectedReason && (
              <div className="rounded bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                Lý do từ chối: {qr.rejectedReason}
              </div>
            )}
          </div>
        </div>
      )}

      {qr?.qrStatus === 'Pending' && !editMode && (
        <div className="space-y-3 pt-1">
          <FormField label="Lý do từ chối (nếu từ chối)">
            <textarea className="input-field resize-none h-16" placeholder="Nhập lý do..."
              value={rejectReason} onChange={e => setReject(e.target.value)} />
          </FormField>
          <div className="flex gap-2">
            <button onClick={() => handleReview(false)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60">
              {saving && <Spinner className="w-3 h-3" />}
              <XCircle size={14} /> Từ chối
            </button>
            <button onClick={() => handleReview(true)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60">
              {saving && <Spinner className="w-3 h-3" />}
              <CheckCircle2 size={14} /> Phê duyệt
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Seller Modal với 2 tab ────────────────────────────────
const SellerModal = ({ isOpen, onClose, onSaved, editSeller }) => {
  const isEdit = !!editSeller
  const [tab, setTab]         = useState('info')
  const [form, setForm]       = useState({ name: '', email: '', password: '', phoneNumber: '', latitude: '', longitude: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setTab('info')
    setForm(editSeller
      ? { 
          name: editSeller.name, 
          email: editSeller.email, 
          password: '', 
          phoneNumber: editSeller.phoneNumber || '', 
          latitude: editSeller.latitude || '', 
          longitude: editSeller.longitude || '' 
        }
      : { name: '', email: '', password: '', phoneNumber: '', latitude: '', longitude: '' }
    )
  }, [editSeller, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        const data = { 
          name: form.name, 
          email: form.email, 
          phoneNumber: form.phoneNumber,
          latitude: form.latitude ? parseFloat(form.latitude) : null,
          longitude: form.longitude ? parseFloat(form.longitude) : null
        }
        if (form.password) data.password = form.password
        await sellerService.update(editSeller.id, data)
        toast.success('Cập nhật thành công!')
      } else {
        await sellerService.create({ name: form.name, email: form.email, password: form.password })
        toast.success('Tạo seller thành công!')
      }
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!')
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}
      title={isEdit ? `Seller: ${editSeller?.name}` : 'Thêm Seller'}
      size="md">

      {isEdit && (
        <div className="flex gap-1 border-b border-gray-200 mb-5 -mt-2">
          {[
            { key: 'info', label: 'Thông tin' },
            { key: 'qr',   label: 'Thanh toán QR' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.key === 'qr' && <QrCode size={13} className="inline mr-1.5" />}
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === 'info' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Họ tên" required>
            <input className="input-field" placeholder="Nguyễn Văn A" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </FormField>
          <FormField label="Email" required>
            <input type="email" className="input-field" placeholder="seller@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </FormField>
          <FormField label={isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'} required={!isEdit}>
            <input type="password" className="input-field" placeholder="••••••••"
              value={form.password} required={!isEdit}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </FormField>
          <FormField label="Số điện thoại">
            <input className="input-field" placeholder="03xxxx" value={form.phoneNumber}
              onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Vĩ độ (Lat)">
              <input type="number" step="any" className="input-field" placeholder="10.xxx" value={form.latitude}
                onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
            </FormField>
            <FormField label="Kinh độ (Lng)">
              <input type="number" step="any" className="input-field" placeholder="106.xxx" value={form.longitude}
                onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
            </FormField>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      )}

      {tab === 'qr' && isEdit && (
        <SellerQrTab seller={editSeller} onUpdated={onSaved} />
      )}
    </Modal>
  )
}

// ─── SellersPage ──────────────────────────────────────────
export const SellersPage = () => {
  const { setLoading: setGlobalLoading } = useGlobalLoading()
  const [sellers, setSellers]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [modal, setModal]           = useState(false)
  const [editSeller, setEditSeller] = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const load = async () => {
    setLoading(true)
    setGlobalLoading(true)
    try {
      const res = await sellerService.getAll()
      const sellerList = res.data

      const token = localStorage.getItem('token')
      const sellersWithQr = await Promise.all(
        sellerList.map(async (seller) => {
          try {
            const qrRes = await fetch(`${SELLER_API}/api/seller/${seller.id}/qr`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            })
            if (qrRes.ok) {
              const qrData = await qrRes.json()
              return { ...seller, qrStatus: qrData.qrStatus || 'None' }
            }
          } catch { }
          return { ...seller, qrStatus: 'None' }
        })
      )

      setSellers(sellersWithQr)
    } catch {
      toast.error('Không tải được danh sách!')
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
      await sellerService.delete(deleteId)
      toast.success('Xóa thành công!')
      setDeleteId(null); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Xóa thất bại!') }
    finally { setDeleting(false); setGlobalLoading(false) }
  }

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Quản lý Sellers ({sellers.length})</h1>
        <button onClick={() => { setEditSeller(null); setModal(true) }} className="btn-primary">
          <Plus size={16} /> Thêm Seller
        </button>
      </div>
      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm theo tên hoặc email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <DataTable
          headers={['#', 'Họ tên', 'Email', 'QR', 'Ngày tạo', 'Thao tác']}
          empty={filtered.length === 0 &&
            <EmptyState icon={Store} title="Không có seller nào" desc="Thêm seller để bắt đầu" />}
        >
          {filtered.map((seller, i) => (
            <tr key={seller.id} className="table-row">
              <td className="py-3 px-4 text-gray-400">{i + 1}</td>
              <td className="py-3 px-4 font-medium text-gray-900">{seller.name}</td>
              <td className="py-3 px-4 text-gray-600">{seller.email}</td>
              <td className="py-3 px-4">
                <QrStatusBadge status={seller.qrStatus || 'None'} />
              </td>
              <td className="py-3 px-4 text-gray-500">{new Date(seller.createdAt).toLocaleDateString('vi-VN')}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button onClick={() => { setEditSeller(seller); setModal(true) }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(seller.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
      <SellerModal isOpen={modal} onClose={() => setModal(false)} onSaved={load} editSeller={editSeller} />
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={deleting} title="Xóa Seller" message="Bạn có chắc muốn xóa seller này không?" />
    </div>
  )
}