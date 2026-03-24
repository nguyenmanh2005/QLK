import { useEffect, useState } from 'react';
import { Users, Package, ShoppingCart, Clock } from 'lucide-react';
import { userService, productService, orderService } from '../services/api';
import { StatCard, PageLoader, StatusBadge } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useGlobalLoading } from '../context/LoadingContext';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { setLoading: setGlobalLoading } = useGlobalLoading();
  const [stats, setStats]   = useState({ users: 0, products: 0, orders: 0, pending: 0 });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setGlobalLoading(true);
      try {
        const [uRes, pRes, oRes] = await Promise.allSettled([
          userService.getAll(),
          productService.getAll(),
          orderService.getAll(),
        ]);

        if (uRes.status === 'rejected') console.warn('Users API failed:', uRes.reason);
        if (pRes.status === 'rejected') console.warn('Products API failed:', pRes.reason);
        if (oRes.status === 'rejected') console.warn('Orders API failed:', oRes.reason);

        const users    = uRes.status === 'fulfilled' ? (uRes.value?.data ?? uRes.value ?? []) : [];
        const products = pRes.status === 'fulfilled' ? (pRes.value?.data ?? pRes.value ?? []) : [];
        const all      = oRes.status === 'fulfilled' ? (oRes.value?.data ?? oRes.value ?? []) : [];

        if (!Array.isArray(all)) {
          console.error('Orders response is not an array:', all);
          throw new Error('Unexpected API response shape');
        }

        setStats({
          users:    Array.isArray(users)    ? users.length    : 0,
          products: Array.isArray(products) ? products.length : 0,
          orders:   all.length,
          pending:  all.filter(x => x.status === 'Pending').length,
        });
        setOrders([...all].reverse().slice(0, 5));
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <PageLoader />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
      <p className="text-red-500 font-medium">Không thể tải dữ liệu</p>
      <p className="text-sm text-gray-400">{error}</p>
      <button
        onClick={() => { setLoading(true); setError(null); }}
        className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Thử lại
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Xin chào, {user?.name}!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}        label="Tổng Users"   value={stats.users}    color="bg-blue-100 text-blue-600" />
        <StatCard icon={Package}      label="Sản phẩm"     value={stats.products} color="bg-purple-100 text-purple-600" />
        <StatCard icon={ShoppingCart} label="Tổng Orders"  value={stats.orders}   color="bg-green-100 text-green-600" />
        <StatCard icon={Clock}        label="Chờ xử lý"    value={stats.pending}  color="bg-yellow-100 text-yellow-600" />
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Orders gần đây</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Chưa có order nào</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">ID</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Khách hàng</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Sản phẩm</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Tổng tiền</th>
                <th className="text-left py-2 px-3 text-xs text-gray-500 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-500">#{o.id}</td>
                  <td className="py-2 px-3 text-gray-700">{o.user?.name || 'N/A'}</td>
                  <td className="py-2 px-3 text-gray-700">{o.product?.name || 'N/A'}</td>
                  <td className="py-2 px-3 font-medium">{parseFloat(o.totalPrice).toLocaleString('vi-VN')}đ</td>
                  <td className="py-2 px-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};