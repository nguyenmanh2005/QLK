import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const { items, updateQty, removeFromCart, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 text-sm mb-6">Hãy thêm sản phẩm vào giỏ để tiếp tục</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Giỏ hàng ({totalItems} sản phẩm)
      </h1>

      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="card p-4 flex items-center gap-4">
            {/* Icon */}
            <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-6 h-6 text-gray-300" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
              <p className="text-blue-600 font-semibold text-sm">
                {parseFloat(item.price).toLocaleString('vi-VN')}đ
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                className="w-7 h-7 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600"
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                disabled={item.quantity >= item.stock}
                className="w-7 h-7 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center text-gray-600 disabled:opacity-40"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Subtotal */}
            <div className="text-right w-28 flex-shrink-0">
              <p className="font-semibold text-gray-900 text-sm">
                {(parseFloat(item.price) * item.quantity).toLocaleString('vi-VN')}đ
              </p>
            </div>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600">Tổng cộng ({totalItems} sản phẩm)</span>
          <span className="text-xl font-bold text-blue-600">
            {totalPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="btn-secondary flex-1 justify-center">
            Tiếp tục mua
          </Link>
          <Link to="/checkout" className="btn-primary flex-1 justify-center">
            Đặt hàng <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};
