// Supabase-based API service
import { supabase, supabaseHelpers } from './supabase.js';

// Auth functions
export const authAPI = {
  async login(email, password) {
    const result = await supabaseHelpers.signIn(email, password);
    if (result.data?.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user));
      localStorage.setItem('session', JSON.stringify(result.data.session));
    }
    return result;
  },

  async register(userData) {
    const result = await supabaseHelpers.signUp(userData.email, userData.password, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber
    });
    return result;
  },

  async logout() {
    const result = await supabaseHelpers.signOut();
    localStorage.removeItem('user');
    localStorage.removeItem('session');
    return result;
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getUserRole() {
    const user = this.getCurrentUser();
    return user?.user_metadata?.role || 'user'; // default user
  },

  isAdmin() {
    return this.getUserRole() === 'admin';
  },

  isUser() {
    return this.getUserRole() === 'user';
  }
};

// Categories API
export const categoriesAPI = {
  async getAll() {
    return await supabaseHelpers.getCategories();
  },

  async create(category) {
    return await supabaseHelpers.addCategory(category);
  }
};

// Products API
export const productsAPI = {
  async getAll(filters = {}) {
    return await supabaseHelpers.getProducts();
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async create(product) {
    return await supabaseHelpers.addProduct(product);
  },

  async update(id, product) {
    return await supabaseHelpers.updateProduct(id, product);
  },

  async delete(id) {
    return await supabaseHelpers.deleteProduct(id);
  },

  async getLowStock() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .lte('stock_quantity', supabase.raw('minimum_stock_level'))
      .eq('is_active', true);
    return { data, error };
  }
};

// Stock Transactions API
export const stockTransactionsAPI = {
  async getAll() {
    return await supabaseHelpers.getStockTransactions();
  },

  async create(transaction) {
    return await supabaseHelpers.addStockTransaction(transaction);
  }
};

// Stock Requests API
export const stockRequestsAPI = {
  async getAll() {
    return await supabaseHelpers.getStockRequests();
  },

  async create(request) {
    return await supabaseHelpers.addStockRequest(request);
  },

  async update(id, updates) {
    return await supabaseHelpers.updateStockRequest(id, updates);
  }
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    try {
      // Products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Low stock count  
      const { count: lowStockCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .lte('stock_quantity', supabase.raw('minimum_stock_level'))
        .eq('is_active', true);

      // Pending requests count
      const { count: pendingRequestsCount } = await supabase
        .from('stock_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      // Recent transactions
      const { data: recentTransactions } = await supabase
        .from('stock_transactions')
        .select('*, products(name)')
        .order('transaction_date', { ascending: false })
        .limit(5);

      return {
        data: {
          totalProducts: productsCount || 0,
          lowStockProducts: lowStockCount || 0,
          pendingRequests: pendingRequestsCount || 0,
          recentTransactions: recentTransactions || []
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Legacy axios-style API object for backward compatibility
const api = {
  async get(url) {
    console.log('Legacy API GET:', url);
    
    if (url.includes('/auth/profile')) {
      // Supabase'den current user bilgisi al
      const user = authAPI.getCurrentUser();
      return { data: user || {} };
    }
    if (url.includes('/dashboard/stats')) {
      const result = await dashboardAPI.getStats();
      return { data: result.data || {} };
    }
    if (url.includes('/products')) {
      const result = await productsAPI.getAll();
      return { data: result.data || [] };
    }
    if (url.includes('/categories')) {
      const result = await categoriesAPI.getAll();
      return { data: result.data || [] };
    }
    if (url.includes('/stocktransactions')) {
      const result = await stockTransactionsAPI.getAll();
      return { data: result.data || [] };
    }
    if (url.includes('/stockrequests')) {
      const result = await stockRequestsAPI.getAll();
      return { data: result.data || [] };
    }
    if (url.includes('/auth/admin-requests')) {
      // Admin requests - şimdilik boş array döndür
      return { data: [] };
    }
    if (url.includes('/products/low-stock')) {
      const result = await productsAPI.getLowStock();
      return { data: result.data || [] };
    }
    
    console.warn('Legacy API endpoint not supported:', url);
    return { data: [] };
  },

  async post(url, data) {
    console.log('Legacy API POST:', url, data);
    
    if (url.includes('/auth/login')) {
      return await authAPI.login(data.email, data.password);
    }
    if (url.includes('/auth/register')) {
      return await authAPI.register(data);
    }
    if (url.includes('/categories')) {
      const result = await categoriesAPI.create(data);
      return { data: result.data };
    }
    if (url.includes('/products')) {
      const result = await productsAPI.create(data);
      return { data: result.data };
    }
    if (url.includes('/stocktransactions')) {
      const result = await stockTransactionsAPI.create(data);
      return { data: result.data };
    }
    if (url.includes('/stockrequests')) {
      const result = await stockRequestsAPI.create(data);
      return { data: result.data };
    }
    
    console.warn('Legacy API endpoint not supported:', url);
    return { data: null };
  },

  async put(url, data) {
    console.log('Legacy API PUT:', url, data);
    
    const id = url.split('/').pop();
    
    if (url.includes('/products/')) {
      const result = await productsAPI.update(id, data);
      return { data: result.data };
    }
    if (url.includes('/stockrequests/')) {
      const result = await stockRequestsAPI.update(id, data);
      return { data: result.data };
    }
    
    console.warn('Legacy API endpoint not supported:', url);
    return { data: null };
  },

  async delete(url) {
    console.log('Legacy API DELETE:', url);
    
    const id = url.split('/').pop();
    
    if (url.includes('/products/')) {
      const result = await productsAPI.delete(id);
      return { data: result.data };
    }
    
    console.warn('Legacy API endpoint not supported:', url);
    return { data: null };
  }
};

export default api;
