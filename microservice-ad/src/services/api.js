import axios from 'axios';

const USER_URL    = 'http://localhost:5268/api';
const PRODUCT_URL = 'http://localhost:5159/api';
const ORDER_URL   = 'http://localhost:5291/api';

// ─── Axios instances ───────────────────────────────────────
const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });

  // Tự động thêm JWT token vào mọi request
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // Tự động redirect nếu token hết hạn
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

const userApi    = createInstance(USER_URL);
const productApi = createInstance(PRODUCT_URL);
const orderApi   = createInstance(ORDER_URL);

// ═══════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════
export const authService = {
  login:    (data) => userApi.post('/users/login', data),
  register: (data) => userApi.post('/users', data),
};

// ═══════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════
export const userService = {
  getAll:    ()         => userApi.get('/users'),
  getById:   (id)       => userApi.get(`/users/${id}`),
  create:    (data)     => userApi.post('/users', data),
  update:    (id, data) => userApi.put(`/users/${id}`, data),
  delete:    (id)       => userApi.delete(`/users/${id}`),
};

// ═══════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════
export const productService = {
  getAll:  ()         => productApi.get('/products'),
  getById: (id)       => productApi.get(`/products/${id}`),
  create:  (data)     => productApi.post('/products', data),
  update:  (id, data) => productApi.put(`/products/${id}`, data),
  delete:  (id)       => productApi.delete(`/products/${id}`),
};

// ═══════════════════════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════════════════════
export const orderService = {
  getAll:       ()             => orderApi.get('/orders'),
  getById:      (id)           => orderApi.get(`/orders/${id}`),
  getByUser:    (userId)       => orderApi.get(`/orders/user/${userId}`),
  create:       (data)         => orderApi.post('/orders', data),
  updateStatus: (id, status)   => orderApi.patch(`/orders/${id}/status`, { status }),
  delete:       (id)           => orderApi.delete(`/orders/${id}`),
};