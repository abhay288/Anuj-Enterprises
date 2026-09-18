const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'anujfmcg.com' ||
      host === 'www.anujfmcg.com' ||
      host.endsWith('.vercel.app')
    ) {
      return '/api/v1';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

export const apiClient = async (endpoint, options = {}) => {
  const API_BASE_URL = getApiBaseUrl();
  const token = localStorage.getItem('anuj_jwt_token');

  let isAdminUser = false;
  try {
    const userStr = localStorage.getItem('anuj_user_v2') || localStorage.getItem('anuj_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if (u?.role?.toLowerCase() === 'admin') isAdminUser = true;
    }
  } catch (e) {}

  const isAdmin = isAdminUser || Boolean(localStorage.getItem('anuj_admin_pwd'));

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isAdmin ? { 'x-admin-auth': 'true', 'x-admin-key': 'anuj_admin_master' } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Strict JSON Content-Type validation to prevent HTML SPA fallbacks from masking API failures
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const error = new Error(`Expected JSON API response from ${endpoint} but received "${contentType || 'non-JSON'}" (Status: ${response.status})`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `API Request Failed with status ${response.status}`);
      error.code = data.code;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    console.warn(`[Anuj API Resilience] Network call to ${endpoint} failed:`, err.message || err);
    throw err;
  }
};
