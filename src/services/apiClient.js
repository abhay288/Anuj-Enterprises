const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1');

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('anuj_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API Request Failed');
      error.code = data.code;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    // If backend server is starting or unavailable, rethrow for graceful fallback handling
    throw err;
  }
};
