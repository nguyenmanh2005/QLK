import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/"          element={<HomePage />} />
            <Route path="/login"     element={<LoginPage />} />
            <Route path="/register"  element={<RegisterPage />} />
            <Route path="/cart"      element={<CartPage />} />
            <Route path="/checkout"  element={<CheckoutPage />} />
            <Route path="/orders"    element={<OrdersPage />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' },
              success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
