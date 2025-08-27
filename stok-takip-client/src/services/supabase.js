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
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async addProduct(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select();
    return { data, error };
  },

  async updateProduct(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
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
    const { data, error } = await supabase
      .from('stock_transactions')
      .select(`
        *,
        products (
          name
        )
      `)
      .order('transaction_date', { ascending: false });
    return { data, error };
  },

  async addStockTransaction(transaction) {
    const { data, error } = await supabase
      .from('stock_transactions')
      .insert([transaction])
      .select();
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
