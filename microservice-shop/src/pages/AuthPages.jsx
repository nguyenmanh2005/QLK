import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthLayout = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-sm p-8">
      <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
      {children}
    </div>
  </div>
);

export const LoginPage = () => {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng!');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn quay lại!">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <input type="email" className="input-field" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Mật khẩu</label>
          <input type="password" className="input-field" placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">Đăng ký ngay</Link>
      </p>
    </AuthLayout>
  );
};

export const RegisterPage = () => {
  const [form, setForm]     = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const { register }        = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự!'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại!');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Đăng ký để mua sắm ngay!">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Họ tên</label>
          <input type="text" className="input-field" placeholder="Nguyễn Văn A"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
          <input type="email" className="input-field" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1">Mật khẩu</label>
          <input type="password" className="input-field" placeholder="Ít nhất 6 ký tự"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
          {loading ? 'Đang đăng ký...' : 'Tạo tài khoản'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">Đăng nhập</Link>
      </p>
    </AuthLayout>
  );
};
