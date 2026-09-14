const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

export const apiClient = async (endpoint, options = {}) => {
  const API_BASE_URL = getApiBaseUrl();
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
    
    // Check if response is valid JSON
    const contentType = response.headers.get('content-type');
    let data = {};
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    }

    if (!response.ok) {
      const error = new Error(data.message || `API Request Failed with status ${response.status}`);
      error.code = data.code;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[Anuj API Resilience] Network call to ${endpoint} handled safely:`, err.message || err);
    throw err;
  }
};
