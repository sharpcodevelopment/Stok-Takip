// Session temizleme scripti
// Bu scripti console'da çalıştırın

// Tüm localStorage'ı temizle
localStorage.clear();

// Tüm sessionStorage'ı temizle
sessionStorage.clear();

// Supabase session'ı da temizle
if (window.supabase) {
  window.supabase.auth.signOut();
}

console.log('✅ Tüm session verileri temizlendi!');
console.log('🔄 Sayfayı yenileyin ve tekrar giriş yapın.');
