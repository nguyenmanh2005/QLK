import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { Layout } from './components/Layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { SellersPage } from './pages/SellersPage';
import { ShippersPage } from './pages/ShippersPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { QrPage } from './pages/QrPage';
import { CategoriesPage } from './pages/Categoriespage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Spinner } from './components/UI';

const ProtectedRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Spinner size="lg" />
    </div>
  );
  return isAuth ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/dashboard"   element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
    <Route path="/users"       element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
    <Route path="/sellers"     element={<ProtectedRoute><Layout><SellersPage /></Layout></ProtectedRoute>} />
    <Route path="/shippers"    element={<ProtectedRoute><Layout><ShippersPage /></Layout></ProtectedRoute>} />
    <Route path="/products"    element={<ProtectedRoute><Layout><ProductsPage /></Layout></ProtectedRoute>} />
    <Route path="/orders"      element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
    <Route path="/qr"          element={<ProtectedRoute><Layout><QrPage /></Layout></ProtectedRoute>} />
    <Route path="/categories"  element={<ProtectedRoute><Layout><CategoriesPage /></Layout></ProtectedRoute>} />

    <Route path="/"  element={<Navigate to="/dashboard" replace />} />
    <Route path="*"  element={<NotFoundPage />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LoadingProvider>
          <AppRoutes />
          <Toaster position="top-right"
            toastOptions={{
              style: {
                background: '#1e293b', color: '#f1f5f9',
                border: '1px solid #334155', borderRadius: '12px', fontSize: '14px',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#1e293b' } },
              error:   { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
            }}
          />
        </LoadingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}