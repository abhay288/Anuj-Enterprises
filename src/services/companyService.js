import { apiClient } from './apiClient';

export const companyService = {
  getCompanies: async () => apiClient('/companies'),
  createCompany: async (companyData) => {
    const payload = typeof companyData === 'string' ? { name: companyData } : companyData;
    return apiClient('/companies', { method: 'POST', body: JSON.stringify(payload) });
  },
  deleteCompany: async (id) => apiClient(`/companies/${id}`, { method: 'DELETE' }),
  updateRanks: async (ranks) => apiClient('/companies/ranks', { method: 'PUT', body: JSON.stringify({ ranks }) })
};

export const categoryService = {
  getCategories: async () => apiClient('/categories'),
  createCategory: async (name) => apiClient('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCategory: async (id) => apiClient(`/categories/${id}`, { method: 'DELETE' })
};
