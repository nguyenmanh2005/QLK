import { useEffect, useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Clock, Search, RefreshCw, Building2, Loader2 } from 'lucide-react';
import { qrService } from '../services/api';
import { Modal, FormField, PageLoader, EmptyState, DataTable } from '../components/UI';
import { useGlobalLoading } from '../context/LoadingContext';
import toast from 'react-hot-toast';

const SELLER_API = 'http://localhost:5183';

const BANKS = {
  '970415': 'VietinBank', '970436': 'Vietcombank', '970418': 'BIDV',
  '970405': 'Agribank',   '970422': 'MB Bank',      '970432': 'VPBank',
  '970423': 'Techcombank','970416': 'ACB',           '970403': 'Sacombank',
  '970433': 'HDBank',     '970448': 'OCB',           '970426': 'MSB',
};

const QrStatusBadge = ({ status }) => {
  const map = {
    Approved: 'bg-green-100 text-green-700',
    Pending:  'bg-yellow-100 text-yellow-700',
    Rejected: 'bg-red-100 text-red-700',
    None:     'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || map.None}`}>
      {status === 'Approved' && <CheckCircle2 size={11} />}
      {status === 'Pending'  && <Clock        size={11} />}
      {status === 'Rejected' && <XCircle      size={11} />}
      {status}
    </span>
  );
};

const ReviewModal = ({ isOpen, onClose, onSaved, seller }) => {
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleReview = async (approved) => {
    if (!approved && !reason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    setLoading(true);
    try {
      await qrService.review(seller.sellerId, approved, approved ? undefined : reason);
      toast.success(approved ? 'Đã phê duyệt!' : 'Đã từ chối!');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  if (!seller) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Duyệt QR — ${seller.sellerName}`} size="md">
      <div className="space-y-5">
        {/* QR Preview */}
        <div className="flex gap-4 items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
          <img
            src={`${SELLER_API}/api/seller/qr/image/${seller.bankCode}/${seller.accountNo}?name=${encodeURIComponent(seller.accountName)}`}
            onError={e => {
              e.target.src = `https://api.vietqr.io/image/${seller.bankCode}-${seller.accountNo}-compact2.jpg?accountName=${encodeURIComponent(seller.accountName)}`;
            }}
            alt="QR"
            className="h-28 w-28 rounded-lg border border-gray-200 bg-white object-contain p-1 flex-shrink-0"
          />
          <div className="space-y-2 text-sm flex-1">
            <div className="flex justify-between">
              <span className="text-gray-500">Seller</span>
              <span className="font-medium text-gray-900">{seller.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-700">{seller.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Ngân hàng</span>
              <span className="font-medium text-gray-900">{BANKS[seller.bankCode] || seller.bankCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số tài khoản</span>
              <span className="font-medium text-gray-900">{seller.accountNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Chủ tài khoản</span>
              <span className="font-medium text-gray-900">{seller.accountName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Nộp lúc</span>
              <span className="text-gray-500">{new Date(seller.submittedAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Reject reason */}
        <FormField label="Lý do từ chối (bắt buộc nếu từ chối)">
          <textarea
            className="input-field resize-none h-20"
            placeholder="Nhập lý do từ chối để seller biết cần sửa gì..."
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </FormField>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Hủy</button>
          <button
            onClick={() => handleReview(false)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <XCircle size={14} /> Từ chối
          </button>
          <button
            onClick={() => handleReview(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            <CheckCircle2 size={14} /> Phê duyệt
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const QrPage = () => {
  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const [pending, setPending]   = useState([]);
  const [all, setAll]           = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('pending');
  const [search, setSearch]     = useState('');
  const [modal, setModal]       = useState(false);
  const [selected, setSelected] = useState(null);

  const loadPending = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const data = await qrService.getPending();
      setPending(data);
    } catch (err) {
      toast.error('Không tải được danh sách!');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    setGlobalLoading(true);
    try {
      const data = await qrService.getAllSellers();
      setAll(data);
    } catch (err) {
      toast.error('Không tải được danh sách!');
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'pending') loadPending();
    else loadAll();
  }, [tab]);

  const handleSaved = () => {
    loadPending();
    loadAll();
  };

  const filtered = (tab === 'pending' ? pending : all).filter(s =>
    !search ||
    s.sellerName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý QR thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">Duyệt đăng ký QR của seller</p>
        </div>
        <button
          onClick={() => tab === 'pending' ? loadPending() : loadAll()}
          className="btn-secondary"
        >
          <RefreshCw size={15} /> Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'pending', label: 'Chờ duyệt', count: pending.length },
          { key: 'all',     label: 'Tất cả seller', count: null },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-white text-xs font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Tìm theo tên hoặc email seller..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {tab === 'pending' ? (
          <DataTable
            headers={['Seller', 'Email', 'Ngân hàng', 'Số tài khoản', 'Chủ TK', 'Nộp lúc', 'Thao tác']}
            empty={filtered.length === 0 &&
              <EmptyState icon={QrCode} title="Không có đơn nào chờ duyệt" desc="Tất cả đơn đã được xử lý" />}
          >
            {filtered.map(s => (
              <tr key={s.sellerId} className="table-row">
                <td className="py-3 px-4 font-medium text-gray-900">{s.sellerName}</td>
                <td className="py-3 px-4 text-gray-600">{s.email}</td>
                <td className="py-3 px-4 text-gray-700">{BANKS[s.bankCode] || s.bankCode}</td>
                <td className="py-3 px-4 font-mono text-sm text-gray-700">{s.accountNo}</td>
                <td className="py-3 px-4 text-gray-700">{s.accountName}</td>
                <td className="py-3 px-4 text-gray-500">{new Date(s.submittedAt).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => { setSelected(s); setModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                  >
                    <QrCode size={12} /> Xem & Duyệt
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <DataTable
            headers={['Seller', 'Email', 'Ngân hàng', 'Số tài khoản', 'Trạng thái QR', 'Thao tác']}
            empty={filtered.length === 0 &&
              <EmptyState icon={Building2} title="Không có seller nào" desc="" />}
          >
            {filtered.map(s => (
              <tr key={s.sellerId} className="table-row">
                <td className="py-3 px-4 font-medium text-gray-900">{s.sellerName}</td>
                <td className="py-3 px-4 text-gray-600">{s.email}</td>
                <td className="py-3 px-4 text-gray-700">{s.bankCode ? (BANKS[s.bankCode] || s.bankCode) : '—'}</td>
                <td className="py-3 px-4 font-mono text-sm text-gray-700">{s.accountNo || '—'}</td>
                <td className="py-3 px-4"><QrStatusBadge status={s.qrStatus} /></td>
                <td className="py-3 px-4">
                  {s.qrStatus === 'Pending' && (
                    <button
                      onClick={() => { setSelected(s); setModal(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
                    >
                      <QrCode size={12} /> Duyệt
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>

      <ReviewModal
        isOpen={modal}
        onClose={() => { setModal(false); setSelected(null); }}
        onSaved={handleSaved}
        seller={selected}
      />
    </div>
  );
};