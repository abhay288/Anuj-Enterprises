import { apiClient } from './apiClient';

export const companyService = {
  getCompanies: async () => apiClient('/companies'),
  createCompany: async (name) => apiClient('/companies', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCompany: async (id) => apiClient(`/companies/${id}`, { method: 'DELETE' })
};

export const categoryService = {
  getCategories: async () => apiClient('/categories'),
  createCategory: async (name) => apiClient('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCategory: async (id) => apiClient(`/categories/${id}`, { method: 'DELETE' })
};
