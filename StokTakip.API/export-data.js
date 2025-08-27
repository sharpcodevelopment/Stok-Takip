// Mevcut SQL Server verilerini JSON olarak export etmek için script

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8080/api';

async function exportData() {
    try {
        console.log('🔄 Veriler export ediliyor...');
        
        // 1. Login (admin kullanıcı gerekli)
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@stoktakip.com', // Admin email
                password: 'Admin123!'         // Admin şifre
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Login failed');
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // 2. Categories Export
        console.log('📂 Categories export ediliyor...');
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`, { headers });
        const categories = await categoriesResponse.json();
        
        // 3. Products Export
        console.log('📦 Products export ediliyor...');
        const productsResponse = await fetch(`${API_BASE_URL}/products?pageSize=1000`, { headers });
        const productsData = await productsResponse.json();
        const products = productsData.products || productsData;
        
        // 4. Stock Transactions Export
        console.log('📊 Stock Transactions export ediliyor...');
        const transactionsResponse = await fetch(`${API_BASE_URL}/stocktransactions?pageSize=1000`, { headers });
        const transactionsData = await transactionsResponse.json();
        const transactions = transactionsData.transactions || transactionsData;
        
        // 5. Stock Requests Export
        console.log('📋 Stock Requests export ediliyor...');
        const requestsResponse = await fetch(`${API_BASE_URL}/stockrequests?pageSize=1000`, { headers });
        const requestsData = await requestsResponse.json();
        const requests = requestsData.requests || requestsData;
        
        // 6. Data Export
        const exportData = {
            categories: categories,
            products: products,
            stockTransactions: transactions,
            stockRequests: requests,
            exportDate: new Date().toISOString()
        };
        
        // 7. JSON dosyasına kaydet
        const fs = require('fs');
        fs.writeFileSync('exported-data.json', JSON.stringify(exportData, null, 2));
        
        console.log('✅ Export tamamlandı!');
        console.log(`📂 Categories: ${categories.length || 0}`);
        console.log(`📦 Products: ${products.length || 0}`);
        console.log(`📊 Transactions: ${transactions.length || 0}`);
        console.log(`📋 Requests: ${requests.length || 0}`);
        console.log('💾 Dosya: exported-data.json');
        
    } catch (error) {
        console.error('❌ Export hatası:', error.message);
    }
}

// Script çalıştır
exportData();
