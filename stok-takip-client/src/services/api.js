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
  get: async (url) => {
    // Bu sadece geriye uyumluluk için - kullanılmaması tavsiye edilir
    console.warn('Legacy API kullanımı tespit edildi. Yeni Supabase API\'sini kullanın.');
    return { data: null };
  }
};

export default api;
