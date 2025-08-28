// Supabase kullanıcılarına rol atama script'i
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ehordwomcshznizvoxdk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVob3Jkd29tY3Noem5penZveGRrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjMyNzEyNSwiZXhwIjoyMDcxOTAzMTI1fQ.-Tf7imjCOmgUEKc6xQvkq2GGrP7NeWcMa6woYC3KXTI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Rol haritası - eski sistemdeki rollere göre
const userRoles = {
    // ADMIN KULLANICILAR
    'stok@stoktakip.com': 'admin',
    'admin@stoktakip.com': 'admin', 
    'deneme2@stoktakip.com': 'admin',
    
    // NORMAL KULLANICILAR
    'deneme3@stoktakip.com': 'user',
    'admin2@stoktakip.com': 'user',
    'deneme@stoktakip.com': 'user',
    'kullanici2@stoktakip.com': 'user'
};

async function assignRoles() {
    try {
        console.log('🎭 Supabase kullanıcılarına roller atanıyor...');
        
        // Tüm kullanıcıları al
        const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) {
            throw new Error('Kullanıcılar alınamadı: ' + usersError.message);
        }
        
        console.log(`👥 ${users.users.length} kullanıcı bulundu`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const user of users.users) {
            try {
                const email = user.email;
                const assignedRole = userRoles[email];
                
                if (!assignedRole) {
                    console.log(`⏭️  ${email} - Rol tanımı yok, atlanıyor`);
                    continue;
                }
                
                console.log(`🔄 ${email} → ${assignedRole.toUpperCase()} rolü atanıyor`);
                
                // User metadata'sını güncelle
                const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
                    user_metadata: {
                        ...user.user_metadata,
                        role: assignedRole,
                        assignedAt: new Date().toISOString()
                    }
                });
                
                if (error) {
                    console.error(`❌ ${email} hatası:`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ ${email} başarılı (${assignedRole})`);
                    successCount++;
                }
                
                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ ${user.email} exception:`, error.message);
                errorCount++;
            }
        }
        
        console.log('\n🎉 Rol atama tamamlandı!');
        console.log(`✅ Başarılı: ${successCount}`);
        console.log(`❌ Hatalı: ${errorCount}`);
        
        console.log('\n🎭 ROL DAĞILIMI:');
        const adminEmails = Object.keys(userRoles).filter(email => userRoles[email] === 'admin');
        const userEmails = Object.keys(userRoles).filter(email => userRoles[email] === 'user');
        
        console.log(`👑 Admin (${adminEmails.length}):`);
        adminEmails.forEach(email => console.log(`   - ${email}`));
        
        console.log(`👤 User (${userEmails.length}):`);
        userEmails.forEach(email => console.log(`   - ${email}`));
        
    } catch (error) {
        console.error('❌ Rol atama hatası:', error.message);
    }
}

// Script çalıştır
assignRoles();

