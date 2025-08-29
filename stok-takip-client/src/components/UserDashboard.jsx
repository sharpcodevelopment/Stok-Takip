import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import EmployeeHeader from './EmployeeHeader.jsx';
import './Dashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalTransactions: 0
  });

  const [userRequests, setUserRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchStats();

    fetchUserRequests();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('İstatistikler alınamadı:', error);
      setStats({
        totalProducts: 0,
        totalCategories: 0,
        totalTransactions: 0
      });
    }
  };





  const fetchUserRequests = async () => {
    try {
      const response = await api.get('/stockrequests');
      const allRequests = response.data || [];
      
      // Sadece mevcut kullanıcının taleplerini filtrele - genel çözüm
      const currentUser = await api.get('/auth/profile');
      const currentUserEmail = currentUser.data?.email;
      const currentUserName = currentUser.data?.user_metadata?.firstName + ' ' + currentUser.data?.user_metadata?.lastName;
      
      const userRequests = allRequests.filter(request => {
        const requestByName = request.requestedByName || '';
        return requestByName === currentUserName || 
               requestByName === currentUserEmail ||
               requestByName.includes(currentUserEmail) ||
               (currentUserName !== 'undefined undefined' && requestByName.includes(currentUserName));
      });
      
      setUserRequests(userRequests);
    } catch (error) {
      console.error('Kullanıcı talepleri alınamadı:', error);
      setUserRequests([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info'
    };
    return variants[status] || 'secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Beklemede',
      approved: 'Onaylandı',
      rejected: 'Reddedildi',
      completed: 'Tamamlandı'
    };
    return texts[status] || status;
  };

  return (
    <div className="dashboard-container">
      {/* Modern Navigation Bar */}
      <EmployeeHeader activeMenu="dashboard" />

      {/* Main Content */}
      <Container>
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="welcome-section">
              <h1 className="welcome-title">
                Hoş Geldiniz, {user?.firstName || 'Kullanıcı'}!
              </h1>
              <p className="welcome-subtitle">
                Stok takip sistemini görüntülemek için aşağıdaki seçenekleri kullanabilirsiniz.
              </p>
                             {user?.isAdminRequestPending && (
                               <Alert variant="warning">
                                 <i className="fas fa-clock me-2"></i>
                                 <strong>Admin Onay Talebi:</strong> Admin olma talebiniz alındı ve onay bekleniyor. 
                                 Onaylandıktan sonra yönetici paneline erişim sağlayabileceksiniz.
                               </Alert>
                             )}
                             <Alert variant="info">
                 <i className="fas fa-info-circle me-2"></i>
                 <strong>Mağaza Çalışanı:</strong> Sadece görüntüleme yetkiniz bulunmaktadır. 
                 Stok talepleri için admin ile iletişime geçiniz.
               </Alert>
                             <div className="current-time">
                 <i className="fas fa-clock me-2"></i>
                 {new Date().toLocaleString('tr-TR', {
                   weekday: 'long',
                   year: 'numeric',
                   month: 'long',
                   day: 'numeric',
                   hour: '2-digit',
                   minute: '2-digit',
                   timeZone: 'Europe/Istanbul'
                 })}
               </div>
            </div>
          </Col>
        </Row>

                          {/* Quick Actions - Mağaza Çalışanları İçin */}
         <Row className="mb-4">
           <Col xs={12} md={6}>
             <Card className="action-card">
               <Card.Header>
                 <h5><i className="fas fa-search me-2"></i>Stok Sorgulama</h5>
               </Card.Header>
               <Card.Body>
                 <p className="text-muted mb-3">
                   Ürün stok durumlarını sorgulayabilir ve arama yapabilirsiniz.
                 </p>
                                   <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => navigate('/user-products')}
                  >
                    <i className="fas fa-search me-2"></i>
                    Stok Sorgula
                  </Button>
               </Card.Body>
             </Card>
           </Col>
           <Col xs={12} md={6}>
             <Card className="action-card">
               <Card.Header>
                 <h5><i className="fas fa-clipboard-list me-2"></i>Stok Talepleri</h5>
               </Card.Header>
               <Card.Body>
                 <p className="text-muted mb-3">
                   Mağazada ihtiyaç duyduğunuz ürünler için talep oluşturabilirsiniz.
                 </p>
                                   <Button 
                    variant="success" 
                    className="w-100"
                    onClick={() => navigate('/user-requests')}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Talep Oluştur
                  </Button>
               </Card.Body>
             </Card>
           </Col>
         </Row>

                   {/* User Requests Only */}
          <Row>

            <Col>
              <Card className="recent-card">
                <Card.Header>
                  <h5><i className="fas fa-clipboard-list me-2"></i>Talep Durumlarım</h5>
                </Card.Header>
                <Card.Body>
                  {userRequests.length > 0 ? (
                    userRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="recent-item">
                        <div className="recent-icon">
                          <i className="fas fa-box text-primary"></i>
                        </div>
                        <div className="recent-content">
                          <div className="recent-title">
                            {request.productName}
                            <Badge 
                              bg={getStatusBadge(request.status)} 
                              className="ms-2"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <div className="recent-desc">
                            {request.quantity} adet - {request.priority} öncelik
                          </div>
                                                     <div className="recent-time">
                                                        {new Date(request.createdAt).toLocaleString('tr-TR', {
                             month: 'short',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit',
                             timeZone: 'Europe/Istanbul'
                           })}
                           </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted py-3">
                      <i className="fas fa-clipboard-list fa-2x mb-2"></i>
                      <p>Henüz talep oluşturmadınız</p>
                    </div>
                  )}
                  {userRequests.length > 5 && (
                    <div className="text-center mt-3">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate('/user-requests')}
                      >
                        Tüm Talepleri Görüntüle ({userRequests.length})
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>


      </Container>
    </div>
  );
};

export default UserDashboard;
