// Eski kullanıcıları export etmek için script
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const API_BASE_URL = 'http://localhost:8080/api';
const supabaseUrl = 'https://ehordwomcshznizvoxdk.supabase.co';
// BURAYA SUPABASE SERVICE_ROLE (ADMIN) KEY GELECEk
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3Jkd29tY3Noem5penZveGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMyNzEyNSwiZXhwIjoyMDcxOTAzMTI1fQ.-Tf7imjCOmgUEKc6xQvkq2GGrP7NeWcMa6woYC3KXTI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateUsers() {
    try {
        console.log('🔄 Kullanıcılar export ve migrate ediliyor...');
        
        // 1. .NET API'den login
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
        
        // 2. Kullanıcıları al
        console.log('👥 Kullanıcılar alınıyor...');
        const usersResponse = await fetch(`${API_BASE_URL}/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!usersResponse.ok) {
            throw new Error('Users fetch failed');
        }
        
        const users = await usersResponse.json();
        console.log(`📋 ${users.length} kullanıcı bulundu`);
        
        // 3. Supabase'e migrate et
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of users) {
            try {
                console.log(`🔄 Migrate: ${user.email}`);
                
                // Supabase'de kullanıcı oluştur
                const { data, error } = await supabase.auth.admin.createUser({
                    email: user.email,
                    password: 'TempPassword123!', // Geçici şifre
                    email_confirm: true,
                    user_metadata: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phoneNumber: user.phoneNumber || '',
                        originalId: user.id,
                        migratedAt: new Date().toISOString()
                    }
                });
                
                if (error) {
                    console.error(`❌ ${user.email} hatası:`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ ${user.email} başarılı`);
                    successCount++;
                }
                
                // Rate limiting için bekle
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.error(`❌ ${user.email} exception:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n🎉 Migration tamamlandı!');
        console.log(`✅ Başarılı: ${successCount}`);
        console.log(`❌ Hatalı: ${errorCount}`);
        console.log('\n📝 NOT: Tüm kullanıcıların şifresi "TempPassword123!" olarak ayarlandı');
        console.log('Kullanıcılardan şifrelerini değiştirmelerini isteyin.');
        
    } catch (error) {
        console.error('❌ Migration hatası:', error.message);
    }
}

// Script çalıştır
migrateUsers();
