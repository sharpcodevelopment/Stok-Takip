// Backend API service
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Auth functions
export const authAPI = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { error: { message: 'Login failed' } };
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { error: { message: 'Registration failed' } };
    }
  },

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  getUserRole() {
    const user = this.getCurrentUser();
    return user?.roles?.[0] || 'user';
  },

  isAdmin() {
    return this.getUserRole() === 'Admin';
  },

  isUser() {
    return this.getUserRole() === 'User';
  }
};

// Backend API endpoints will be handled by the main api object

// Legacy axios-style API object for backward compatibility
const api = {
  async get(url) {
    console.log('Backend API GET:', url);
    
    const token = authAPI.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API GET error:', error);
      return { data: null, error };
    }
  },

  async post(url, data) {
    console.log('Backend API POST:', url, data);
    
    const token = authAPI.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error('API POST error:', error);
      return { data: null, error };
    }
  },

  async put(url, data) {
    console.log('Backend API PUT:', url, data);
    
    const token = authAPI.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error('API PUT error:', error);
      return { data: null, error };
    }
  },

  async delete(url) {
    console.log('Backend API DELETE:', url);
    
    const token = authAPI.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      return { data: result };
    } catch (error) {
      console.error('API DELETE error:', error);
      return { data: null, error };
    }
  }
};

export default api;
