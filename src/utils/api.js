const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('veloura_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return request(`/products?${query.toString()}`);
  },

  getProductById: (id) => request(`/products/${id}`),
  getCategories: () => request('/products/categories'),

  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  verifyOtp: (payload) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
  resendOtp: (payload) => request('/auth/resend-otp', { method: 'POST', body: JSON.stringify(payload) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),

  createRazorpayOrder: (orderData) => request('/orders/razorpay', { method: 'POST', body: JSON.stringify(orderData) }),
  verifyPayment: (payload) => request('/orders/verify', { method: 'POST', body: JSON.stringify(payload) }),
  createCodOrder: (payload) => request('/orders/cod', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: (email) => request(`/orders/my-orders?email=${encodeURIComponent(email)}`),
  getOrderById: (id) => request(`/orders/${id}`),

  checkHealth: () => request('/health'),
};

async function adminRequest(endpoint, options = {}) {
  const token = localStorage.getItem('veloura_admin_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}/admin${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const adminApi = {
  login: (credentials) => adminRequest('/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getStats: () => adminRequest('/stats'),

  getProducts: () => adminRequest('/products'),
  createProduct: (product) => adminRequest('/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id, product) => adminRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id) => adminRequest(`/products/${id}`, { method: 'DELETE' }),

  getOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return adminRequest(`/orders?${query.toString()}`);
  },
  updateOrderStatus: (id, payload) =>
    adminRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
};