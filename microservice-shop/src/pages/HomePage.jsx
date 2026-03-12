import { useEffect, useState } from 'react';
import { ShoppingCart, Search, Loader2, Package } from 'lucide-react';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const { addToCart }           = useCart();

  useEffect(() => {
    productService.getAll()
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Không tải được sản phẩm!'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToCart = (product) => {
    if (product.stock < 1) { toast.error('Sản phẩm đã hết hàng!'); return; }
    addToCart(product, 1);
    toast.success(`Đã thêm "${product.name}" vào giỏ!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tất cả sản phẩm</h1>
        <p className="text-gray-500 text-sm">{products.length} sản phẩm có sẵn</p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input-field pl-9" placeholder="Tìm sản phẩm..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400">Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {/* Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => (
            <div key={product.id} className="card overflow-hidden flex flex-col">
              {/* Ảnh sản phẩm */}
              <div className="bg-gray-100 h-44 overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full items-center justify-center"
                  style={{ display: product.imageUrl ? 'none' : 'flex' }}
                >
                  <Package className="w-10 h-10 text-gray-300" />
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-medium text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                )}
                <div className="mt-auto">
                  <p className="text-blue-600 font-bold mb-1">
                    {parseFloat(product.price).toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    {product.stock > 0 ? `Còn ${product.stock} sp` : 'Hết hàng'}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock < 1}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    {product.stock < 1 ? 'Hết hàng' : 'Thêm vào giỏ'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};