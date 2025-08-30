import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card, InputGroup } from 'react-bootstrap';
import { authAPI } from '../services/api.js';
import { supabase } from '../services/supabase.js';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('employee'); // 'admin' veya 'employee'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Supabase API'sini kullan
        const result = await authAPI.login(formData.email, formData.password);
        
        if (result.error) {
          throw new Error(result.error.message || 'Giriş başarısız');
        }
        
        // Supabase response'undan user bilgilerini al
        const { user } = result.data;
        
        // Rol kontrolü ve yönlendirme - Supabase profiles tablosundan al
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, is_admin_request_pending')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.error('Profil bilgisi alınamadı:', profileError);
            setError('Kullanıcı bilgileri alınamadı.');
            return;
          }
          
          const userRole = profileData?.role || 'user';
          const isAdminRequestPending = profileData?.is_admin_request_pending || false;
          
          // Debug için log
          console.log('Profile data:', profileData);
          console.log('User role:', userRole);
          console.log('Is admin request pending:', isAdminRequestPending);
        
        // Rol ve seçilen kullanıcı tipi kontrolü
        if (userType === 'admin') {
          // Yönetici bölümü seçildi
          if (userRole === 'admin' && !isAdminRequestPending) {
            navigate('/dashboard');
          } else if (userRole === 'admin' && isAdminRequestPending) {
            setError('Admin olma talebiniz henüz onaylanmadı. Lütfen "Mağaza Çalışanı" bölümünden giriş yapın.');
            return;
          } else {
            setError('Bu hesap yönetici değil. Lütfen "Mağaza Çalışanı" bölümünden giriş yapın.');
            return;
          }
        } else {
          // Mağaza çalışanı bölümü seçildi  
          if (userRole === 'user' || (userRole === 'admin' && isAdminRequestPending)) {
            navigate('/user-dashboard');
          } else {
            setError('Bu hesap yönetici hesabı. Lütfen "Yönetici" bölümünden giriş yapın.');
            return;
          }
        }
      } else {
        // Kayıt işlemi - userType'a göre kayıt olur
        const registerData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phoneNumber: formData.phoneNumber,
          isAdminRegistration: userType === 'admin' // Admin kayıt mı?
        };

        // Supabase API'sini kullan
        const result = await authAPI.register(registerData);
        
        if (result.error) {
          throw new Error(result.error.message || 'Kayıt işlemi başarısız');
        }
        
        // Kayıt başarılı - Supabase response'una göre yönlendir
        
        // Supabase response'una göre yönlendirme
        const userRole = result.data?.user?.user_metadata?.role || 'user';
        const isAdminRequestPending = result.data?.user?.user_metadata?.isAdminRequestPending || false;
        
        if (userRole === 'admin' && isAdminRequestPending) {
          // Admin kayıt talebi beklemede - kullanıcı dashboard'una yönlendir
          alert('✅ Admin olma talebiniz başarıyla alındı!\n\n📋 Durum: Ana admin onayı bekleniyor\n👤 Şimdilik: Normal kullanıcı olarak giriş yapabilirsiniz\n📧 Bildirim: Onay durumu hakkında bilgilendirileceksiniz');
          navigate('/user-dashboard');
        } else if (userRole === 'user') {
          // Normal kullanıcı kaydı - direkt mağaza paneline yönlendir
          alert('✅ Kayıt başarılı!\n\n👤 Hesap türü: Mağaza Çalışanı\n🏪 Panel: Mağaza Paneli\n📋 Durum: Sisteme giriş yapabilirsiniz');
          navigate('/user-dashboard');
        } else {
          // Admin onaylanmış - admin paneline yönlendir
          alert('✅ Admin hesabınız onaylandı!\n\n👤 Hesap türü: Yönetici\n🏢 Panel: Yönetici Paneli\n📋 Durum: Sisteme giriş yapabilirsiniz');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      // Validation hatalarını göster
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors.join(', '));
      } else {
        setError(err.response?.data?.message || (isLogin ? 'Giriş yapılırken hata oluştu' : 'Kayıt olurken hata oluştu'));
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: ''
    });
  };

  const toggleUserType = () => {
    setUserType(userType === 'admin' ? 'employee' : 'admin');
    setError('');
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        <div className="login-card-wrapper">
          <Card className="login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-3">
                <div className="login-logo">
                  <span className="logo-icon">📦</span>
                </div>
                <h2 className="login-title">Stok Takip Sistemi</h2>
                <p className="login-subtitle">
                  {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                </p>
                
                {/* User Type Toggle */}
                <div className="user-type-toggle mb-3">
                  <div className="btn-group" role="group">
                    <Button
                      variant={userType === 'employee' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setUserType('employee');
                        setError('');
                      }}
                      size="sm"
                    >
                      <i className="fas fa-store me-1"></i>
                      Mağaza Çalışanı
                    </Button>
                    <Button
                      variant={userType === 'admin' ? 'primary' : 'outline-primary'}
                      onClick={() => {
                        setUserType('admin');
                        setError('');
                      }}
                      size="sm"
                    >
                      <i className="fas fa-user-shield me-1"></i>
                      Yönetici
                    </Button>
                  </div>
                </div>
              </div>

              {error && (
                <Alert variant={error.includes('onayı bekleniyor') ? 'info' : 'danger'} className="login-alert mb-3">
                  <i className={`fas ${error.includes('onayı bekleniyor') ? 'fa-info-circle' : 'fa-exclamation-triangle'} me-2`}></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} className="login-form">
                {!isLogin && (
                  <>
                    <div className="row">
                      <div className="col-12 col-sm-6">
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            <i className="fas fa-user me-2"></i>
                            Ad
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="form-control-custom"
                            placeholder="Adınız"
                            required={!isLogin}
                          />
                        </Form.Group>
                      </div>
                      <div className="col-12 col-sm-6">
                        <Form.Group className="mb-3">
                          <Form.Label className="form-label">
                            <i className="fas fa-user me-2"></i>
                            Soyad
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="form-control-custom"
                            placeholder="Soyadınız"
                            required={!isLogin}
                          />
                        </Form.Group>
                      </div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label className="form-label">
                        <i className="fas fa-phone me-2"></i>
                        Telefon
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="0555 123 45 67"
                      />
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <i className="fas fa-envelope me-2"></i>
                    Email Adresi
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control-custom"
                    placeholder="ornek@email.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="form-label">
                    <i className="fas fa-lock me-2"></i>
                    Şifre
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control-custom"
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </Button>
                  </InputGroup>
                </Form.Group>

                {!isLogin && (
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label">
                      <i className="fas fa-lock me-2"></i>
                      Şifre Tekrar
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="form-control-custom"
                        placeholder="••••••••"
                        required={!isLogin}
                      />
                      <Button
                        variant="outline-secondary"
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="password-toggle"
                      >
                        <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>
                )}

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="login-button w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {isLogin ? 'Giriş Yapılıyor...' : 'Kayıt Yapılıyor...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} me-2`}></i>
                      {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={toggleMode}
                  className="mode-toggle"
                >
                  {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
