// Eski kullanıcıların rollerini kontrol etmek için script
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:8080/api';

async function checkUserRoles() {
    try {
        console.log('🔄 Kullanıcı rolleri kontrol ediliyor...');
        
        // 1. Admin login
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@stoktakip.com',
                password: 'Admin123!'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error('Admin login failed');
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.token;
        
        // 2. Kullanıcıları ve rollerini al
        console.log('👥 Kullanıcılar ve rolleri alınıyor...');
        const usersResponse = await fetch(`${API_BASE_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!usersResponse.ok) {
            throw new Error('Users fetch failed');
        }
        
        const users = await usersResponse.json();
        
        console.log('\n📋 KULLANICI ROL LİSTESİ:');
        console.log('=====================================');
        
        users.forEach(user => {
            const roles = user.roles || [];
            const roleString = roles.length > 0 ? roles.join(', ') : 'No roles';
            const isSuperAdmin = user.isSuperAdmin ? ' (SuperAdmin)' : '';
            
            console.log(`📧 ${user.email}`);
            console.log(`   👤 ${user.firstName} ${user.lastName}`);
            console.log(`   🎭 Roller: ${roleString}${isSuperAdmin}`);
            console.log(`   📱 Telefon: ${user.phoneNumber || 'N/A'}`);
            console.log('---');
        });
        
        console.log('\n🎯 ÖZET:');
        const adminUsers = users.filter(u => u.roles?.includes('Admin'));
        const regularUsers = users.filter(u => !u.roles?.includes('Admin'));
        
        console.log(`👑 Admin kullanıcılar: ${adminUsers.length}`);
        adminUsers.forEach(u => console.log(`   - ${u.email}`));
        
        console.log(`👤 Normal kullanıcılar: ${regularUsers.length}`);
        regularUsers.forEach(u => console.log(`   - ${u.email}`));
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
    }
}

// Script çalıştır
checkUserRoles();

