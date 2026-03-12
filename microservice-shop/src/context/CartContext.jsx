import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shop_cart') || '[]');
    } catch { return []; }
  });

  // Lưu vào localStorage mỗi khi items thay đổi
  useEffect(() => {
    localStorage.setItem('shop_cart', JSON.stringify(items));
  }, [items]);

  // Thêm sản phẩm vào giỏ
  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  // Cập nhật số lượng
  const updateQty = (productId, quantity) => {
    if (quantity < 1) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  // Xóa khỏi giỏ
  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.id !== productId));
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
