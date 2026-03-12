import axios from 'axios';

// ─── Đổi port cho đúng với máy bạn ───────────────────────
const USER_URL    = 'https://localhost:7296/api';
const PRODUCT_URL = 'https://localhost:7084/api';
const ORDER_URL   = 'https://localhost:7062/api';

const createInstance = (baseURL) => {
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('shop_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('shop_token');
        localStorage.removeItem('shop_user');
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

export const authService = {
  login:    (data) => userApi.post('/users/login', data),
  register: (data) => userApi.post('/users', data),
};

export const productService = {
  getAll:  ()    => productApi.get('/products'),
  getById: (id)  => productApi.get(`/products/${id}`),
};

export const orderService = {
  create:    (data)   => orderApi.post('/orders', data),
  getByUser: (userId) => orderApi.get(`/orders/user/${userId}`),
};
