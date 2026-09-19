import { apiClient } from './apiClient';

const inFlightRequests = new Map();

export const productService = {
  getProducts: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.company && filters.company !== 'All') query.append('company', filters.company);
    if (filters.category && filters.category !== 'All') query.append('category', filters.category);
    if (filters.search) query.append('search', filters.search);
    if (filters.featured) query.append('featured', 'true');
    if (filters.newProduct) query.append('newProduct', 'true');
    if (filters.status) query.append('status', filters.status);
    if (filters.limit) query.append('limit', String(filters.limit));
    if (filters.page) query.append('page', String(filters.page));
    if (filters.sort) query.append('sort', String(filters.sort));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const endpoint = `/products${queryString}`;

    // In-flight request deduplication: reuse active Promise for concurrent requests
    if (inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint);
    }

    const requestPromise = apiClient(endpoint).finally(() => {
      inFlightRequests.delete(endpoint);
    });

    inFlightRequests.set(endpoint, requestPromise);
    return requestPromise;
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

  deleteProduct: async (id, extra = {}) => {
    return apiClient(`/products/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(extra)
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

  updateProductRanks: async (ranks) => {
    return apiClient('/products/ranks', {
      method: 'PUT',
      body: JSON.stringify({ ranks })
    });
  }
};
