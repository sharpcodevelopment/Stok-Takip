// Exported verileri Supabase'e import etmek için script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://ehordwomcshznizvoxdk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3Jkd29tY3Noem5penZveGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjcxMjUsImV4cCI6MjA3MTkwMzEyNX0.GguhWjIghvUR5RgF-t2rhHJF1JMyOF_BQ4k6n46pQGA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importToSupabase() {
    try {
        console.log('🚀 Supabase\'e veri import ediliyor...');
        
        // Export edilmiş veriyi oku
        const exportedData = JSON.parse(fs.readFileSync('exported-data.json', 'utf8'));
        
        // 1. Categories Import
        console.log('📂 Categories import ediliyor...');
        const categoriesData = exportedData.categories.map(cat => ({
            name: cat.name,
            description: cat.description,
            created_at: cat.createdAt,
            is_active: cat.isActive
        }));
        
        const { data: categoriesResult, error: categoriesError } = await supabase
            .from('categories')
            .insert(categoriesData);
            
        if (categoriesError) {
            console.error('❌ Categories import hatası:', categoriesError);
        } else {
            console.log(`✅ ${categoriesData.length} kategori import edildi`);
        }
        
        // 2. Products Import
        console.log('📦 Products import ediliyor...');
        const productsData = exportedData.products.map(product => ({
            name: product.name,
            brand: product.brand,
            model: product.model,
            barcode: product.barcode,
            description: product.description,
            size: product.size,
            color: product.color,
            price: product.price,
            stock_quantity: product.stockQuantity,
            minimum_stock_level: product.minimumStockLevel,
            category_id: product.categoryId,
            created_at: product.createdAt,
            updated_at: product.updatedAt,
            is_active: product.isActive
        }));
        
        const { data: productsResult, error: productsError } = await supabase
            .from('products')
            .insert(productsData);
            
        if (productsError) {
            console.error('❌ Products import hatası:', productsError);
        } else {
            console.log(`✅ ${productsData.length} ürün import edildi`);
        }
        
        // 3. Stock Transactions Import
        console.log('📊 Stock Transactions import ediliyor...');
        const transactionsData = exportedData.stockTransactions.map(transaction => ({
            product_id: transaction.productId,
            transaction_type: transaction.transactionType === 0 ? 'In' : 'Out', // Enum'dan string'e
            quantity: transaction.quantity,
            unit_price: transaction.unitPrice,
            notes: transaction.notes,
            transaction_date: transaction.transactionDate
        }));
        
        const { data: transactionsResult, error: transactionsError } = await supabase
            .from('stock_transactions')
            .insert(transactionsData);
            
        if (transactionsError) {
            console.error('❌ Stock Transactions import hatası:', transactionsError);
        } else {
            console.log(`✅ ${transactionsData.length} stok hareketi import edildi`);
        }
        
        // 4. Stock Requests Import
        console.log('📋 Stock Requests import ediliyor...');
        const requestsData = exportedData.stockRequests.map(request => ({
            product_id: request.productId,
            requested_quantity: request.requestedQuantity,
            request_reason: request.requestReason,
            status: request.status,
            approval_notes: request.approvalNotes,
            rejection_reason: request.rejectionReason,
            created_at: request.createdAt,
            updated_at: request.updatedAt
        }));
        
        const { data: requestsResult, error: requestsError } = await supabase
            .from('stock_requests')
            .insert(requestsData);
            
        if (requestsError) {
            console.error('❌ Stock Requests import hatası:', requestsError);
        } else {
            console.log(`✅ ${requestsData.length} stok talebi import edildi`);
        }
        
        console.log('\n🎉 Tüm veriler Supabase\'e başarıyla import edildi!');
        console.log('🌐 Supabase Dashboard\'da kontrol edebilirsin!');
        
    } catch (error) {
        console.error('❌ Import hatası:', error.message);
    }
}

// Script çalıştır
importToSupabase();
