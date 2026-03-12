import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Loader2, Package } from 'lucide-react';
import { orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = {
    Pending:   'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export const OrdersPage = () => {
  const { user, isAuth } = useAuth();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuth || !user?.id) { setLoading(false); return; }
    orderService.getByUser(user.id)
      .then(res => setOrders([...res.data].reverse()))
      .catch(() => toast.error('Không tải được đơn hàng!'))
      .finally(() => setLoading(false));
  }, [isAuth, user]);

  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem đơn hàng</p>
        <Link to="/login" className="btn-primary inline-flex justify-center px-6">Đăng nhập</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Đơn hàng của tôi</h1>
        <Link to="/" className="text-sm text-blue-600 hover:underline">Tiếp tục mua sắm</Link>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin w-7 h-7 text-blue-600" />
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Chưa có đơn hàng nào</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">Hãy mua sắm để tạo đơn hàng đầu tiên!</p>
          <Link to="/" className="btn-primary inline-flex justify-center px-6">Mua ngay</Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Đơn #{order.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sản phẩm</span>
                  <span className="text-gray-900 font-medium">{order.product?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số lượng</span>
                  <span className="text-gray-900">{order.quantity}</span>
                </div>
                <div className="flex justify-between text-sm pt-1.5 border-t border-gray-200">
                  <span className="text-gray-600 font-medium">Tổng tiền</span>
                  <span className="text-blue-600 font-bold">
                    {parseFloat(order.totalPrice).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
