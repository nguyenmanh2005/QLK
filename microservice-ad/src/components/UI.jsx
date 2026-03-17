import { AlertCircle, X, Loader2 } from 'lucide-react';

export const Spinner = ({ className = '' }) => (
  <Loader2 className={`animate-spin w-5 h-5 text-blue-600 ${className}`} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner />
  </div>
);

export const EmptyState = ({ icon: Icon, title, desc }) => (
  <div className="text-center py-12">
    <Icon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 font-medium">{title}</p>
    <p className="text-gray-400 text-sm mt-1">{desc}</p>
  </div>
);

export const ErrorAlert = ({ message, onClose }) => (
  <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
    <p className="text-red-700 text-sm flex-1">{message}</p>
    {onClose && (
      <button onClick={onClose} className="text-red-400 hover:text-red-600">
        <X className="w-4 h-4" />
      </button>
    )}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-xl w-full ${sizes[size]} shadow-xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const FormField = ({ label, children, required }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`badge ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-gray-600 text-sm mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <button onClick={onClose} className="btn-secondary">Hủy</button>
      <button onClick={onConfirm} disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50">
        {loading && <Spinner />}
        Xác nhận xóa
      </button>
    </div>
  </Modal>
);

export const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export const DataTable = ({ headers, children, loading, empty }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          {headers.map((h, i) => (
            <th key={i} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={headers.length} className="py-16 text-center">
              <Spinner className="mx-auto" />
            </td>
          </tr>
        ) : children}
      </tbody>
    </table>
    {!loading && empty}
  </div>
);
