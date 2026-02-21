import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: params => {
    const searchParams = new URLSearchParams()
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key])
      }
    }
    searchParams.append('_', Date.now())
    return searchParams.toString()
  }
})

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// =============================
// AUTH API
// =============================
export const authAPI = {
  login: (data) => api.post('auth/login/', data),
  register: (data) => api.post('auth/register/', data),
  logout: () => api.post('auth/logout/'),
  getUser: () => api.get('auth/user/'),
  changePassword: (data) => api.post('auth/change-password/', data)
}

// =============================
// BOOKS API
// =============================
export const booksAPI = {
  getAll: (params) => api.get('books/', { params }),
  getOne: (id) => api.get(`books/${id}/`),
  create: (data) => api.post('books/', data),
  update: (id, data) => api.put(`books/${id}/`, data),
  delete: (id) => api.delete(`books/${id}/`)
}

// =============================
// MEMBERS API (Admin only)
// =============================
export const membersAPI = {
  getAll: () => api.get('users/'),
  getOne: (id) => api.get(`users/${id}/`),
  create: (data) => api.post('users/', data),
  update: (id, data) => api.put(`users/${id}/`, data),
  delete: (id) => api.delete(`users/${id}/`)
}

// =============================
// BORROWS API
// =============================
export const borrowsAPI = {
  getAll: (params) => api.get('borrows/', { params }),
  getMyBorrows: () => api.get('borrows/'),
  create: (data) => api.post('borrows/', data),
  returnBook: (id) => api.put(`borrows/${id}/return/`),
  delete: (id) => api.delete(`borrows/${id}/`)
}

// =============================
// FINES API
// =============================
export const finesAPI = {
  getAll: () => api.get('fines/'),
  getMyFines: () => api.get('fines/'),
  create: (data) => api.post('fines/', data),
  payFine: (id) => api.post(`fines/${id}/pay/`)
}

// =============================
// DASHBOARD API
// =============================
export const dashboardAPI = {
  getStats: () => api.get('dashboard-stats/')
}