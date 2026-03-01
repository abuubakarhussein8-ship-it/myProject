import axios from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const isLocalhost =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const fallbackBaseUrl = isLocalhost
  ? "http://127.0.0.1:8000/api/"
  : "https://library-backend.onrender.com/api/";
const API_BASE_URL = (configuredBaseUrl || fallbackBaseUrl).replace(/\/?$/, "/");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

const clearAuth = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
};

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      return Promise.reject(new Error("No refresh token available"));
    }
    refreshPromise = axios
      .post(`${API_BASE_URL}token/refresh/`, { refresh })
      .then((response) => {
        const { access, refresh: newRefresh } = response.data;
        localStorage.setItem("access", access);
        if (newRefresh) {
          localStorage.setItem("refresh", newRefresh);
        }
        return access;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;
    const isAuthPath =
      originalRequest?.url?.includes("auth/login") ||
      originalRequest?.url?.includes("auth/register") ||
      originalRequest?.url?.includes("token/refresh");

    if (isUnauthorized && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccess = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post("auth/login/", data),
  register: (data) => api.post("auth/register/", data),
  me: () => api.get("auth/me/"),
};

export const dashboardAPI = {
  getStats: () => api.get("dashboard-stats/"),
};

export const booksAPI = {
  getAll: (params) => api.get("books/", { params }),
  create: (data) => api.post("books/", data),
  update: (id, data) => api.patch(`books/${id}/`, data),
  delete: (id) => api.delete(`books/${id}/`),
};

export const membersAPI = {
  getAll: (params) => api.get("auth/users/", { params }),
  getOne: (id) => api.get(`auth/users/${id}/`),
  create: (data) => api.post("auth/users/", data),
  update: (id, data) => api.patch(`auth/users/${id}/`, data),
  delete: (id) => api.delete(`auth/users/${id}/`),
};

export const borrowsAPI = {
  getAll: (params) => api.get("borrows/", { params }),
  getHistory: (params) => api.get("borrows/history/", { params }),
  borrow: (data) => api.post("borrows/", data),
  returnBook: (id) => api.post(`borrows/${id}/return_book/`),
};

export const finesAPI = {
  getAll: (params) => api.get("fines/", { params }),
  pay: (id) => api.post(`fines/${id}/pay/`),
};
