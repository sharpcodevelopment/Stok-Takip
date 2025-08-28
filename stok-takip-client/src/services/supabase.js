import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ehordwomcshznizvoxdk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3Jkd29tY3Noem5penZveGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjcxMjUsImV4cCI6MjA3MTkwMzEyNX0.GguhWjIghvUR5RgF-t2rhHJF1JMyOF_BQ4k6n46pQGA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const supabaseHelpers = {
  // Auth functions
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Database functions
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        category_id,
        price,
        stock_quantity,
        minimum_stock_level,
        size,
        color,
        is_active,
        created_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    // Veri formatını frontend'e uygun hale getir
    const formattedData = data?.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      categoryId: product.category_id,
      price: product.price,
      stockQuantity: product.stock_quantity,
      minStockLevel: product.minimum_stock_level,
      size: product.size,
      color: product.color,
      isActive: product.is_active,
      createdAt: product.created_at
    })) || [];
    
    return { data: formattedData, error };
  },

  async addProduct(product) {
    // Yerel saat diliminde şu anki tarih ve saat - ISO string yerine yerel format
    const now = new Date();
    const localDateTime = now.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/,/g, ' ').replace(/\s+/g, ' ');
    
    // Veri formatını Supabase'e uygun hale getir
    const formattedProduct = {
      name: product.name,
      description: product.description,
      category_id: product.categoryId,
      price: product.price,
      stock_quantity: product.stockQuantity,
      minimum_stock_level: product.minStockLevel || 10,
      size: product.size,
      color: product.color,
      is_active: true,
      created_at: localDateTime,
      updated_at: localDateTime
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([formattedProduct])
      .select();
    return { data, error };
  },

  async updateProduct(id, updates) {
    // Veri formatını Supabase'e uygun hale getir
    const formattedUpdates = {
      name: updates.name,
      description: updates.description,
      category_id: updates.categoryId,
      price: updates.price,
      stock_quantity: updates.stockQuantity,
      minimum_stock_level: updates.minStockLevel || updates.minimum_stock_level,
      size: updates.size,
      color: updates.color,
      is_active: updates.isActive !== undefined ? updates.isActive : true
    };
    
    const { data, error } = await supabase
      .from('products')
      .update(formattedUpdates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async deleteProduct(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    return { error };
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  async addCategory(category) {
    // Yerel saat diliminde şu anki tarih ve saat - ISO string yerine yerel format
    const now = new Date();
    const localDateTime = now.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/,/g, ' ').replace(/\s+/g, ' ');
    
    const formattedCategory = {
      ...category,
      created_at: localDateTime,
      updated_at: localDateTime
    };
    
    const { data, error } = await supabase
      .from('categories')
      .insert([formattedCategory])
      .select();
    return { data, error };
  },

  // Stock Transactions
  async getStockTransactions() {
    // Ürün adını da al
    const { data, error } = await supabase
      .from('stock_transactions')
      .select(`
        *,
        products (
          name
        )
      `)
      .order('transaction_date', { ascending: false });
    
    if (error) {
      return { data: [], error };
    }
    
    // Veri formatını frontend'e uygun hale getir
    const formattedData = data?.map(transaction => ({
      id: transaction.id,
      productId: transaction.product_id || transaction.productId,
      transactionType: Number(transaction.transaction_type || transaction.transactionType), // Number'a çevir
      quantity: transaction.quantity,
      unitPrice: transaction.unit_price || transaction.unitPrice,
      notes: transaction.notes,
      transactionDate: transaction.transaction_date || transaction.transactionDate,
      createdAt: transaction.transaction_date, // created_at yerine transaction_date kullan
      productName: transaction.products?.name || 'Bilinmeyen Ürün'
    })) || [];
    
    return { data: formattedData, error };
  },

  async addStockTransaction(transaction) {
    // Yerel saat diliminde şu anki tarih ve saat - ISO string yerine yerel format
    const now = new Date();
    const localDateTime = now.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/,/g, ' ').replace(/\s+/g, ' ');
    
    // Veri formatını Supabase'e uygun hale getir - created_at kolonu yok
    const formattedTransaction = {
      product_id: transaction.productId,
      transaction_type: transaction.transactionType,
      quantity: transaction.quantity,
      unit_price: transaction.unitPrice || 0,
      notes: transaction.notes || '',
      transaction_date: localDateTime
    };
    

    
    const { data, error } = await supabase
      .from('stock_transactions')
      .insert([formattedTransaction])
      .select();
      
    if (error) {
      // Add transaction error
    }
    
    return { data, error };
  },

  // Stock Requests
  async getStockRequests() {
    const { data, error } = await supabase
      .from('stock_requests')
      .select(`
        *,
        products (
          name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      return { data: [], error };
    }
    
    // Veri formatını frontend'e uygun hale getir
    const formattedData = data?.map(request => ({
      id: request.id,
      productId: request.product_id || request.productId,
      productName: request.products?.name || 'Bilinmeyen Ürün',
      quantity: request.requested_quantity || request.quantity,
      priority: 'normal', // priority kolonu yok
      notes: request.request_reason || request.notes || '',
      status: request.status,
      requestedById: '', // requested_by_id kolonu yok
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      approvedById: '', // approved_by_id kolonu yok
      approvedAt: null, // approved_at kolonu yok
      rejectionReason: request.rejection_reason || ''
    })) || [];
    
    return { data: formattedData, error };
  },

  async addStockRequest(request) {
    // Yerel saat diliminde şu anki tarih ve saat - ISO string yerine yerel format
    const now = new Date();
    const localDateTime = now.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/,/g, ' ').replace(/\s+/g, ' ');
    
    // Supabase tablo yapısına göre doğru kolonları kullan
    const formattedRequest = {
      product_id: request.productId,
      requested_quantity: request.quantity,
      request_reason: request.notes || '',
      status: 'pending',
      created_at: localDateTime,
      updated_at: localDateTime
    };
    
    const { data, error } = await supabase
      .from('stock_requests')
      .insert([formattedRequest])
      .select();
      
    if (error) {
      // Add stock request error
    }
    
    return { data, error };
  },

  async updateStockRequest(id, updates) {
    // Veri formatını Supabase'e uygun hale getir - sadece temel kolonlar
    const formattedUpdates = {};
    
    if (updates.quantity !== undefined) formattedUpdates.requested_quantity = updates.quantity;
    if (updates.notes !== undefined) formattedUpdates.request_reason = updates.notes;
    if (updates.status !== undefined) formattedUpdates.status = updates.status;
    if (updates.rejectionReason !== undefined) formattedUpdates.rejection_reason = updates.rejectionReason;
    
    // Yerel saat diliminde şu anki tarih ve saat - ISO string yerine yerel format
    const now = new Date();
    const localDateTime = now.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/\./g, '-').replace(/,/g, ' ').replace(/\s+/g, ' ');
    
    // updated_at alanını güncelle
    formattedUpdates.updated_at = localDateTime;
    
    const { data, error } = await supabase
      .from('stock_requests')
      .update(formattedUpdates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async deleteStockRequest(id) {
    const { error } = await supabase
      .from('stock_requests')
      .delete()
      .eq('id', id);
    return { error };
  }
};
