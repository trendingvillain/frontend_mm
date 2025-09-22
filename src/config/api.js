import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  
  if (token && !config.url.includes('/admin/')) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (adminToken && config.url.includes('/admin/')) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

// ------------------- User APIs -------------------
export const loginUser = (data) => api.post("/users/login", data);
export const registerUser = (data) => api.post("/users/register", data);
export const fetchProfile = () => api.get("/users/profile");
export const updateProfile = (data) => api.put("/users/profile", data);
export const createOrder = (data) => api.post("/orders", data);
export const fetchUserOrders = () => api.get("/orders");
export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const submitInquiry = (data) => api.post("/inquiries", data);
export const fetchUserInquiries = () => api.get("/inquiries/my");

// ------------------- Public APIs -------------------
export const fetchProducts = () => api.get("/products");
export const fetchProductById = (id) => api.get(`/products/${id}`);
export const fetchPriceById = (id) => api.get(`/prices/${id}`);
export const submitInquiryPublic = (data) => api.post("/inquiries/public", data);

// ------------------- Admin APIs -------------------
export const loginAdmin = (data) => api.post("/admin/login", data);
export const updateUserStatus = (id, data) => api.put(`/admin/users/${id}/status`, data);

// --- Product APIs with image upload ---
export const addProduct = (formData) =>
  api.post("/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchAdminProducts = () => api.get("/admin/products");

// --- Price APIs ---
export const addPriceToProduct = (data) => api.post("/prices", data);

// --- Orders APIs ---
export const fetchAllOrders = () => api.get("/admin/orders");
export const fetchAdminOrderById = (id) => api.get(`admin/orders/${id}`);
export const updateOrderStatus = (id, data) => api.put(`/admin/orders/${id}/status`, data);
export const createOrderInvoice = (id, data) => api.post(`/admin/orders/${id}/invoice`, data);
export const fetchOrdersByUser = (userId) => api.get(`/orders/user/${userId}`);

// --- Users & Inquiries ---
export const fetchAllUsers = () => api.get("/admin/users");
export const fetchAllInquiries = () => api.get("/inquiries/all");
export const updateInquiryStatus = (id, data) => api.put(`/inquiries/${id}/status`, data);
export const postGallery = (data) => api.post("/gallery/upload", data);
export const fetchGallery = () => api.get("/gallery");

export default api;
