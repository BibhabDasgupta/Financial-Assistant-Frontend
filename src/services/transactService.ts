import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('access_token', accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ===== TRANSACTIONS =====
export const transactionApi = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }) => api.get('/transactions', { params }),

  getById: (id: string) => api.get(`/transactions/${id}`),

  create: (data: {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
    category_id: string;
    notes?: string;
    tags?: string[];
  }) => api.post('/transactions', data),

  update: (id: string, data: Partial<{
    type: 'income' | 'expense';
    amount: number;
    description: string;
    date: string;
    category_id: string;
    notes?: string;
    tags?: string[];
  }>) => api.put(`/transactions/${id}`, data),

  delete: (id: string) => api.delete(`/transactions/${id}`),

  getRecent: (limit?: number) => api.get('/transactions/recent', { params: { limit } }),
};

// ===== RECEIPTS =====
export const receiptApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    return api.post('/receipts/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getAll: (status?: 'processing' | 'completed' | 'failed') => 
    api.get('/receipts', { params: { status } }),

  getById: (id: string) => api.get(`/receipts/${id}`),

  getStatus: (id: string) => api.get(`/receipts/${id}/status`),

  delete: (id: string) => api.delete(`/receipts/${id}`),

  reprocess: (id: string) => api.post(`/receipts/${id}/reprocess`),
};

// ===== CATEGORIES =====
export const categoryApi = {
  getAll: (type?: 'income' | 'expense') => api.get('/categories', { params: { type } }),

  getById: (id: string) => api.get(`/categories/${id}`),

  create: (data: {
    name: string;
    type: 'income' | 'expense';
    icon?: string;
    color?: string;
  }) => api.post('/categories', data),

  update: (id: string, data: Partial<{
    name: string;
    icon?: string;
    color?: string;
  }>) => api.put(`/categories/${id}`, data),

  delete: (id: string) => api.delete(`/categories/${id}`),

  getWithCounts: (type?: 'income' | 'expense') => 
    api.get('/categories/with-counts', { params: { type } }),
};

// ===== ANALYTICS/DASHBOARD =====
export const analyticsApi = {
  getDashboard: (month?: number, year?: number) => 
    api.get('/analytics/dashboard', { params: { month, year } }),

  getExpensesByCategory: (month?: number, year?: number) => 
    api.get('/analytics/expenses-by-category', { params: { month, year } }),

  getExpensesOverTime: (months?: number) => 
    api.get('/analytics/expenses-over-time', { params: { months } }),

  getIncomeVsExpenses: (month?: number, year?: number) => 
    api.get('/analytics/income-vs-expenses', { params: { month, year } }),
};

// ===== EXPORT =====
export const exportApi = {
  toCSV: (params?: {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    type?: 'income' | 'expense';
  }) => api.get('/export/csv', { params, responseType: 'blob' }),

  toExcel: (params?: {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    type?: 'income' | 'expense';
  }) => api.get('/export/excel', { params, responseType: 'blob' }),

  toPDF: (params?: {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    type?: 'income' | 'expense';
  }) => api.get('/export/pdf', { params, responseType: 'blob' }),
};


// ... existing imports and axios setup ...

// ===== BUDGETS API =====
export const budgetApi = {
  getAll: (month?: number, year?: number) => 
    api.get('/budgets', { params: { month, year } }),

  getById: (id: string) => 
    api.get(`/budgets/${id}`),

  create: (data: {
    category_id: string;
    amount: number;
    month: number;
    year: number;
  }) => api.post('/budgets', data),

  update: (id: string, data: Partial<{
    amount: number;
  }>) => api.put(`/budgets/${id}`, data),

  delete: (id: string) => 
    api.delete(`/budgets/${id}`),

  getProgress: (month?: number, year?: number) => 
    api.get('/budgets/progress', { params: { month, year } }),
};

// ===== RECURRING TRANSACTIONS API =====
export const recurringApi = {
  getAll: (status?: 'active' | 'paused') => 
    api.get('/recurring', { params: { status } }),

  getById: (id: string) => 
    api.get(`/recurring/${id}`),

  create: (data: {
    category_id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    end_date?: string;
  }) => api.post('/recurring', data),

  update: (id: string, data: Partial<{
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    start_date: string;
    end_date?: string;
    is_active: boolean;
  }>) => api.put(`/recurring/${id}`, data),

  delete: (id: string) => 
    api.delete(`/recurring/${id}`),

  toggleStatus: (id: string) => 
    api.patch(`/recurring/${id}/toggle`),

  getUpcoming: (days?: number) => 
    api.get('/recurring/upcoming', { params: { days } }),
};

// ... rest of existing API exports ...

export default api;