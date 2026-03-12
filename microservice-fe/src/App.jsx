import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { Spinner } from './components/UI';

// ─── Protected Route ───────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
  return isAuth ? children : <Navigate to="/login" replace />;
};

// ─── Public Route (redirect nếu đã đăng nhập) ─────────────
const PublicRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
};

// ─── App Routes ────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

    {/* Protected */}
    <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
    <Route path="/users"     element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
    <Route path="/products"  element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
    <Route path="/orders"    element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />

    {/* Default */}
    <Route path="/"  element={<Navigate to="/dashboard" replace />} />
    <Route path="*"  element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

// ─── Root App ──────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#4ade80', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
