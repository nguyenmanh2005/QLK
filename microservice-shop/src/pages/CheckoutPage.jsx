import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { orderService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const CheckoutPage = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, isAuth }  = useAuth();
  const navigate          = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors]   = useState([]);

  // Chưa đăng nhập
  if (!isAuth) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Bạn cần đăng nhập để đặt hàng</p>
        <Link to="/login" className="btn-primary inline-flex justify-center px-6">
          Đăng nhập
        </Link>
      </div>
    );
  }

  // Giỏ trống
  if (items.length === 0 && !success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Giỏ hàng trống!</p>
        <Link to="/" className="btn-primary inline-flex justify-center px-6">Mua sắm ngay</Link>
      </div>
    );
  }

  // Đặt hàng từng item trong giỏ
  const handleOrder = async () => {
    setLoading(true);
    setErrors([]);
    const failed = [];

    for (const item of items) {
      try {
        await orderService.create({
          userId:    parseInt(user.id),
          productId: item.id,
          quantity:  item.quantity,
        });
      } catch (err) {
        failed.push(`${item.name}: ${err.response?.data?.message || 'Lỗi không xác định'}`);
      }
    }

    setLoading(false);
    if (failed.length === 0) {
      clearCart();
      setSuccess(true);
    } else {
      setErrors(failed);
      if (failed.length < items.length) {
        toast.success('Một số sản phẩm đã được đặt thành công!');
      } else {
        toast.error('Đặt hàng thất bại!');
      }
    }
  };

  // Thành công
  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 text-sm mb-6">Cảm ơn bạn đã mua sắm tại MyShop</p>
        <div className="flex gap-3 justify-center">
          <Link to="/orders" className="btn-secondary">Xem đơn hàng</Link>
          <Link to="/" className="btn-primary">Tiếp tục mua</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Xác nhận đơn hàng</h1>

      {/* Thông tin người mua */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Thông tin người mua</h2>
        <p className="text-sm text-gray-700"><span className="text-gray-500">Họ tên:</span> {user?.name}</p>
        <p className="text-sm text-gray-700 mt-1"><span className="text-gray-500">Email:</span> {user?.email}</p>
      </div>

      {/* Danh sách sản phẩm */}
      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Sản phẩm ({totalItems})</h2>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')}đ
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lỗi nếu có */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-red-700 mb-2">Các sản phẩm lỗi:</p>
          {errors.map((e, i) => <p key={i} className="text-xs text-red-600">• {e}</p>)}
        </div>
      )}

      {/* Tổng tiền */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-medium">Tổng tiền</span>
          <span className="text-xl font-bold text-blue-600">
            {totalPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/cart" className="btn-secondary flex-1 justify-center">Quay lại</Link>
          <button onClick={handleOrder} disabled={loading}
            className="btn-primary flex-1 justify-center">
            {loading ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}
          </button>
        </div>
      </div>
    </div>
  );
};
