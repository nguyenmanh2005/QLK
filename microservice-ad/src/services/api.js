import axios from 'axios';

const ADMIN_URL   = 'http://localhost:5052/api';
const USER_URL    = 'http://localhost:5268/api';
const PRODUCT_URL = 'http://localhost:5159/api';
const ORDER_URL   = 'http://localhost:5291/api';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
  return instance;
};

const adminApi   = createInstance(ADMIN_URL);
const productApi = createInstance(PRODUCT_URL);
const orderApi   = createInstance(ORDER_URL);

export const authService = {
  login:    (data) => adminApi.post('/admin/login', data),
  register: (data) => adminApi.post('/admin/register', data),
};

export const userService = {
  getAll:  ()         => adminApi.get('/admin/users'),
  create:  (data)     => adminApi.post('/admin/users', data),
  update:  (id, data) => adminApi.put(`/admin/users/${id}`, data),
  delete:  (id)       => adminApi.delete(`/admin/users/${id}`),
};

export const sellerService = {
  getAll:  ()         => adminApi.get('/admin/sellers'),
  create:  (data)     => adminApi.post('/admin/sellers', data),
  update:  (id, data) => adminApi.put(`/admin/sellers/${id}`, data),
  delete:  (id)       => adminApi.delete(`/admin/sellers/${id}`),
};

export const shipperService = {
  getAll:  ()         => adminApi.get('/admin/shippers'),
  create:  (data)     => adminApi.post('/admin/shippers', data),
  update:  (id, data) => adminApi.put(`/admin/shippers/${id}`, data),
  delete:  (id)       => adminApi.delete(`/admin/shippers/${id}`),
};

export const productService = {
  getAll:  ()         => productApi.get('/products'),
  getById: (id)       => productApi.get(`/products/${id}`),
  create:  (data)     => productApi.post('/products', data),
  update:  (id, data) => productApi.put(`/products/${id}`, data),
  delete:  (id)       => productApi.delete(`/products/${id}`),
};

export const orderService = {
  getAll:       ()           => orderApi.get('/orders'),
  getById:      (id)         => orderApi.get(`/orders/${id}`),
  getByUser:    (userId)     => orderApi.get(`/orders/user/${userId}`),
  create:       (data)       => orderApi.post('/orders', data),
  updateStatus: (id, status) => orderApi.put(`/orders/${id}/status`, { status }),
  delete:       (id)         => orderApi.delete(`/orders/${id}`),
};