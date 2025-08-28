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
      is_active: true
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
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select();
    return { data, error };
  },

  // Stock Transactions
  async getStockTransactions() {
    // created_at kolonu yok, transaction_date kullan
    const { data, error } = await supabase
      .from('stock_transactions')
      .select('*')
      .order('transaction_date', { ascending: false });
    
    if (error) {
      console.error('Stock transactions error:', error);
      return { data: [], error };
    }
    
    console.log('Raw stock transactions:', data);
    
    // Veri formatını frontend'e uygun hale getir
    const formattedData = data?.map(transaction => ({
      id: transaction.id,
      productId: transaction.product_id || transaction.productId,
      transactionType: transaction.transaction_type || transaction.transactionType,
      quantity: transaction.quantity,
      unitPrice: transaction.unit_price || transaction.unitPrice,
      notes: transaction.notes,
      transactionDate: transaction.transaction_date || transaction.transactionDate,
      createdAt: transaction.transaction_date, // created_at yerine transaction_date kullan
      productName: 'Ürün Adı' // Şimdilik sabit
    })) || [];
    
    console.log('Formatted stock transactions:', formattedData);
    
    return { data: formattedData, error };
  },

  async addStockTransaction(transaction) {
    // Veri formatını Supabase'e uygun hale getir - created_at kolonu yok
    const formattedTransaction = {
      product_id: transaction.productId,
      transaction_type: transaction.transactionType,
      quantity: transaction.quantity,
      unit_price: transaction.unitPrice || 0,
      notes: transaction.notes || '',
      transaction_date: new Date().toISOString()
    };
    
    console.log('Adding transaction:', formattedTransaction);
    
    const { data, error } = await supabase
      .from('stock_transactions')
      .insert([formattedTransaction])
      .select();
      
    if (error) {
      console.error('Add transaction error:', error);
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
    return { data, error };
  },

  async addStockRequest(request) {
    const { data, error } = await supabase
      .from('stock_requests')
      .insert([request])
      .select();
    return { data, error };
  },

  async updateStockRequest(id, updates) {
    const { data, error } = await supabase
      .from('stock_requests')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  }
};
