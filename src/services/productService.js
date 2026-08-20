import { apiClient } from './apiClient';

export const productService = {
  getProducts: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.company && filters.company !== 'All') query.append('company', filters.company);
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.search) query.append('search', filters.search);
    if (filters.featured) query.append('featured', 'true');
    if (filters.newProduct) query.append('newProduct', 'true');
    if (filters.status) query.append('status', filters.status);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient(`/products${queryString}`);
  },

  getProductById: async (id) => {
    return apiClient(`/products/${id}`);
  },

  createProduct: async (productData) => {
    return apiClient('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  updateProduct: async (id, productData) => {
    return apiClient(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(productData)
    });
  },

  deleteProduct: async (id) => {
    return apiClient(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  toggleStatus: async (id) => {
    return apiClient(`/products/${id}/status`, { method: 'PATCH' });
  },

  toggleFeatured: async (id) => {
    return apiClient(`/products/${id}/featured`, { method: 'PATCH' });
  },

  toggleNew: async (id) => {
    return apiClient(`/products/${id}/new`, { method: 'PATCH' });
  },

  validateBulkCsv: async (rows) => {
    return apiClient('/products/bulk/validate', {
      method: 'POST',
      body: JSON.stringify({ rows })
    });
  },

  importBulkCsv: async (products) => {
    return apiClient('/products/bulk/import', {
      method: 'POST',
      body: JSON.stringify({ products })
    });
  }
};
