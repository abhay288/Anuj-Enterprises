import { apiClient } from './apiClient';

export const authService = {
  login: async (identifier, password, role) => {
    const res = await apiClient('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role })
    });
    if (res.data?.token) {
      localStorage.setItem('anuj_jwt_token', res.data.token);
    }
    return res;
  },

  logout: async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch (e) {
      console.log('Logout token cleared');
    }
    localStorage.removeItem('anuj_jwt_token');
  },

  getMe: async () => {
    return apiClient('/auth/me');
  },

  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    return apiClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
    });
  }
};
