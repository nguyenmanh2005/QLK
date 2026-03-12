import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, logout, isAuth } = useAuth();
  const { totalItems }           = useCart();
  const navigate                 = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất!');
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-blue-600">
          <Package size={20} />
          MyShop
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>

          {isAuth ? (
            <div className="flex items-center gap-2">
              <Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50">
                <User size={15} />
                {user?.name}
              </Link>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-lg">
                Đăng nhập
              </Link>
              <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
