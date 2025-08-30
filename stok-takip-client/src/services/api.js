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
    // userType'a göre role belirle
    const role = userData.isAdminRegistration ? 'admin' : 'user';
    
    const result = await supabaseHelpers.signUp(userData.email, userData.password, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      role: role // Role bilgisini ekle
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
    const parsedUser = user ? JSON.parse(user) : null;
    return parsedUser;
  },

  async getUserRole() {
    const user = this.getCurrentUser();
    if (!user) return 'user';
    
    try {
      // Supabase profiles tablosundan rol bilgisini al
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_admin_request_pending')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Rol bilgisi alınamadı:', error);
        return user?.user_metadata?.role || 'user';
      }
      
      return data?.role || 'user';
    } catch (error) {
      console.error('Rol kontrolü hatası:', error);
      return user?.user_metadata?.role || 'user';
    }
  },

  isAdmin() {
    return this.getUserRole() === 'admin';
  },

  isUser() {
    return this.getUserRole() === 'user';
  },

  // Admin request functions
  async getAdminRequests() {
    return await supabaseHelpers.getAdminRequests();
  },

  async approveAdminRequest(userId, isApproved, rejectionReason = null) {
    return await supabaseHelpers.approveAdminRequest(userId, isApproved, rejectionReason);
  }
};

// Categories API
export const categoriesAPI = {
  async getAll() {
    return await supabaseHelpers.getCategories();
  },

  async create(category) {
    return await supabaseHelpers.addCategory(category);
  },

  async update(id, category) {
    return await supabaseHelpers.updateCategory(id, category);
  },

  async delete(id) {
    return await supabaseHelpers.deleteCategory(id);
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
  },

  async delete(id) {
    return await supabaseHelpers.deleteStockRequest(id);
  }
};

// Dashboard API
export const dashboardAPI = {
  async getStats() {
    try {
      // Products count - is_active kontrolünü kaldır
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (productsError) throw productsError;

      // Categories count - is_active kontrolünü kaldır
      const { count: categoriesCount, error: categoriesError } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (categoriesError) throw categoriesError;

      // Transactions count
      const { count: transactionsCount, error: transactionsError } = await supabase
        .from('stock_transactions')
        .select('*', { count: 'exact', head: true });

      if (transactionsError) throw transactionsError;

      // Low stock count - raw yerine manuel kontrol
      const { data: allProducts, error: productsDataError } = await supabase
        .from('products')
        .select('stock_quantity, minimum_stock_level')
        .eq('is_active', true);

      if (productsDataError) throw productsDataError;

      const lowStockCount = allProducts?.filter(product => 
        product.stock_quantity <= product.minimum_stock_level
      ).length || 0;

      // Pending requests count
      const { count: pendingRequestsCount, error: requestsError } = await supabase
        .from('stock_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (requestsError) throw requestsError;

      return {
        data: {
          totalProducts: productsCount || 0,
          totalCategories: categoriesCount || 0,
          totalTransactions: transactionsCount || 0,
          lowStockProducts: lowStockCount || 0,
          pendingRequests: pendingRequestsCount || 0
        },
        error: null
      };
    } catch (error) {
      return { 
        data: {
          totalProducts: 0,
          totalCategories: 0,
          totalTransactions: 0,
          lowStockProducts: 0,
          pendingRequests: 0
        }, 
        error 
      };
    }
  }
};

// Legacy axios-style API object for backward compatibility - TAMAMEN SUPABASE'E YÖNLENDİR
const api = {
  async get(url) {
    // Tüm GET isteklerini Supabase'e yönlendir
    if (url.includes('/auth/profile')) {
      // Supabase'den current user bilgisi al
      const user = authAPI.getCurrentUser();
      return { data: user || {} };
    }
    if (url.includes('/dashboard/stats')) {
      const result = await dashboardAPI.getStats();
      return { data: result.data || {} };
    }
    if (url.includes('/products/') && !url.includes('/products/low-stock')) {
      // Ürün detayı için
      const id = url.split('/').pop();
      const result = await productsAPI.getById(id);
      return { data: result.data };
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
    
    return { data: [] };
  },

  async post(url, data) {
    // Tüm POST isteklerini Supabase'e yönlendir
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
    
    return { data: null };
  },

  async put(url, data) {
    // Tüm PUT isteklerini Supabase'e yönlendir
    if (url.includes('/products/')) {
      const id = url.split('/').pop();
      const result = await productsAPI.update(id, data);
      return { data: result.data };
    }
    if (url.includes('/categories/')) {
      const id = url.split('/').pop();
      const result = await categoriesAPI.update(id, data);
      return { data: result.data };
    }
    if (url.includes('/stockrequests/') && url.includes('/approve')) {
      // Onaylama işlemi - URL'den ID'yi doğru çıkar
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 2]; // approve'dan önceki kısım
      const result = await stockRequestsAPI.update(id, { status: 'approved' });
      return { data: result.data };
    }
    if (url.includes('/stockrequests/') && url.includes('/reject')) {
      // Reddetme işlemi - URL'den ID'yi doğru çıkar
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 2]; // reject'den önceki kısım
      const result = await stockRequestsAPI.update(id, { 
        status: 'rejected',
        rejectionReason: data.reason 
      });
      return { data: result.data };
    }
    if (url.includes('/stockrequests/')) {
      const id = url.split('/').pop();
      const result = await stockRequestsAPI.update(id, data);
      return { data: result.data };
    }
    
    return { data: null };
  },

  async delete(url) {
    // Tüm DELETE isteklerini Supabase'e yönlendir
    const id = url.split('/').pop();
    
    if (url.includes('/products/')) {
      const result = await productsAPI.delete(id);
      return { data: result.data };
    }
    if (url.includes('/categories/')) {
      const result = await categoriesAPI.delete(id);
      return { data: result.data };
    }
    if (url.includes('/stockrequests/')) {
      const result = await stockRequestsAPI.delete(id);
      return { data: result.data };
    }
    
    return { data: null };
  }
};

export default api;
