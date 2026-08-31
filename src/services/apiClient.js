const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Always use same-origin relative /api/v1 on live production domain to prevent CORS/www redirects
    if (host.includes('anujfmcg.com') || host.includes('vercel.app')) {
      return '/api/v1';
    }
  }
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl;
  }
  return import.meta.env.DEV ? 'http://localhost:5000/api/v1' : '/api/v1';
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
