const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // In any browser environment, relative /api/v1 routes to the current origin cleanly
    return '/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || '/api/v1';
};

const isPublicEndpoint = (endpoint) => {
  return endpoint.startsWith('/products') || 
         endpoint.startsWith('/companies') || 
         endpoint.startsWith('/categories');
};

export const apiClient = async (endpoint, options = {}, isRetry = false) => {
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

  // Add 15-second AbortController timeout if not already provided
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);

  const config = {
    ...options,
    headers,
    signal: options.signal || controller.signal
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    clearTimeout(timeoutId);

    // If a public endpoint gets 401 because of an expired/invalid token in localStorage,
    // clear the bad token and retry once as a guest
    if (response.status === 401 && token && isPublicEndpoint(endpoint) && !isRetry) {
      console.warn(`[API] Public endpoint ${endpoint} received 401 with stale token. Retrying without auth.`);
      try { localStorage.removeItem('anuj_jwt_token'); } catch (e) {}
      const retryHeaders = { ...headers };
      delete retryHeaders.Authorization;
      return apiClient(endpoint, { ...options, headers: retryHeaders }, true);
    }
    
    // Strict JSON Content-Type validation to prevent HTML SPA fallbacks from masking API failures
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const error = new Error(`Expected JSON API response from ${endpoint} but received "${contentType || 'non-JSON'}" (Status: ${response.status})`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && (data.code === 'ACCOUNT_DELETED' || data.code === 'ACCOUNT_DISABLED')) {
        try {
          localStorage.removeItem('anuj_jwt_token');
          localStorage.removeItem('anuj_user');
          localStorage.removeItem('anuj_user_v2');
        } catch (e) {}
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('anuj_force_logout', { 
            detail: { message: data.message || '⚠️ Your account has been deleted by Administrator. You have been logged out.' } 
          }));
        }
      }
      const error = new Error(data.message || `API Request Failed with status ${response.status}`);
      error.code = data.code;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Network request to ${endpoint} timed out after 15s`);
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    console.warn(`[Anuj API Resilience] Network call to ${endpoint} failed:`, err.message || err);
    throw err;
  }
};
