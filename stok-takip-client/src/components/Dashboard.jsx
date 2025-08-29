import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import { formatDateForDisplayShort, getRelativeTimeString } from '../utils/dateUtils.js';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalTransactions: 0,
    lowStockProducts: 0,
    pendingRequests: 0
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchStats();
    fetchRecentTransactions();
    fetchLowStockProducts();
    fetchPendingRequests();

    // Gerçek zamanlı veri güncellemesi için interval
    const interval = setInterval(() => {
      fetchStats();
      fetchRecentTransactions();
      fetchPendingRequests();
    }, 30000); // 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  // Gerçek zamanlı saat güncellemesi
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Her saniye güncelle

    return () => clearInterval(timeInterval);
  }, []);

  // Dashboard güncelleme kontrolü
  useEffect(() => {
    const needsUpdate = localStorage.getItem('dashboardNeedsUpdate');
    if (needsUpdate === 'true') {
      fetchRecentTransactions();
      localStorage.removeItem('dashboardNeedsUpdate');
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');

      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      // Kullanıcı bilgileri alınamadı
    }
  };

  const fetchStats = async () => {
    try {
      // Dashboard istatistiklerini al
      const response = await api.get('/dashboard/stats');
      if (response.data) {
        setStats(response.data);
      } else {
        // Varsayılan değerler
        setStats({
          totalProducts: 0,
          totalCategories: 0,
          totalTransactions: 0,
          lowStockProducts: 0,
          pendingRequests: 0
        });
      }
    } catch (error) {
      // İstatistikler alınamadı - hata durumunda varsayılan değerler
      setStats({
        totalProducts: 0,
        totalCategories: 0,
        totalTransactions: 0,
        lowStockProducts: 0,
        pendingRequests: 0
      });
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await api.get('/stocktransactions?pageSize=5');
      const transactions = response.data.transactions || response.data || [];

      setRecentTransactions(transactions);
    } catch (error) {
      // Son işlemler alınamadı
      setRecentTransactions([]);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await api.get('/products/low-stock');
      const products = response.data || [];
      setLowStockProducts(products);
    } catch (error) {
      // Düşük stoklu ürünler alınamadı
      setLowStockProducts([]);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/stockrequests');
      const requests = response.data || [];
      const pendingCount = requests.filter(request => request.status === 'pending').length;
      setPendingRequests(pendingCount);
    } catch (error) {
      // Bekleyen talepler alınamadı
      setPendingRequests(0);
    }
  };



  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={0} />

      {/* Main Content */}
      <Container>
        {/* Welcome Section */}
        <Row className="mb-4">
          <Col>
            <div className="welcome-section">
              <h1 className="welcome-title">
                Hoş Geldiniz, {user?.user_metadata?.firstName || user?.firstName || 'Kullanıcı'} {user?.user_metadata?.lastName || user?.lastName || ''}!
              </h1>
              <p className="welcome-subtitle">
                Stok takip sisteminizi yönetmek için aşağıdaki seçenekleri kullanabilirsiniz.
              </p>
                             <div className="current-time">
                 <i className="fas fa-clock me-2"></i>
                 <span id="current-time-display">
                   {currentTime.toLocaleString('tr-TR', {
                     weekday: 'long',
                     year: 'numeric',
                     month: 'long',
                     day: 'numeric',
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     timeZone: 'Europe/Istanbul'
                   })}
                 </span>
               </div>
            </div>
          </Col>
        </Row>

        {/* Statistics Cards */}
        <Row className="mb-4">
          <Col xs={12} sm={6} md={4} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon products">
                  <i className="fas fa-box"></i>
                </div>
                <div className="stat-number">{stats.totalProducts}</div>
                <div className="stat-label">Toplam Ürün</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon categories">
                  <i className="fas fa-tags"></i>
                </div>
                <div className="stat-number">{stats.totalCategories}</div>
                <div className="stat-label">Toplam Kategori</div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} sm={6} md={4} className="mb-3">
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-icon low-stock">
                  <i className="fas fa-exchange-alt"></i>
                </div>
                <div className="stat-number">{stats.totalTransactions}</div>
                <div className="stat-label">Toplam Hareket</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col xs={12} lg={6}>
            <Card className="action-card">
              <Card.Header>
                <h5><i className="fas fa-plus-circle me-2"></i>Hızlı İşlemler</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="primary" 
                      className="w-100 mb-2"
                      onClick={() => navigate('/products')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Yeni Ürün Ekle
                    </Button>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="success" 
                      className="w-100 mb-2"
                      onClick={() => navigate('/categories')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Yeni Kategori
                    </Button>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="info" 
                      className="w-100 mb-2"
                      onClick={() => navigate('/transactions')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Stok Girişi
                    </Button>
                  </Col>
                  <Col xs={12} sm={6}>
                    <Button 
                      variant="warning" 
                      className="w-100 mb-2"
                      onClick={() => navigate('/transactions')}
                    >
                      <i className="fas fa-minus me-2"></i>
                      Stok Çıkışı
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} lg={6}>
            <Card className="recent-card h-100">
              <Card.Header>
                <h5><i className="fas fa-clock me-2"></i>Son İşlemler</h5>
              </Card.Header>
              <Card.Body>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="recent-item">
                      <div className="recent-icon">
                        <i className={`fas ${transaction.transactionType === 0 ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}`}></i>
                      </div>
                      <div className="recent-content">
                        <div className="recent-title">
                          {transaction.transactionType === 0 ? 'Stok Girişi' : 'Stok Çıkışı'}
                        </div>
                        <div className="recent-desc">
                          {transaction.productName} - {transaction.quantity} adet
                        </div>
                        <div className="recent-time">
                          {formatDateForDisplayShort(transaction.transactionDate || transaction.date) || 'Yakın zamanda'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted py-3">
                    <i className="fas fa-inbox fa-2x mb-2"></i>
                    <p>Henüz stok hareketi bulunmuyor</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Stok Seviyesi Uyarıları */}
        {lowStockProducts.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card className="stock-warning-card">
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Stok Seviyesi Uyarıları ({lowStockProducts.length} ürün)
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row">
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <div key={product.id} className="col-12 col-sm-6 col-lg-4 mb-3">
                        <div className="d-flex align-items-center p-3 border rounded bg-light">
                          <div className="me-3">
                            <i className={`fas fa-2x ${
                              product.stockQuantity === 0 ? 'fa-times-circle text-danger' : 
                              product.stockQuantity <= (product.minStockLevel || 10) / 2 ? 'fa-exclamation-circle text-danger' :
                              'fa-exclamation-triangle text-warning'
                            }`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{product.name}</h6>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className={`badge ${
                                product.stockQuantity === 0 ? 'bg-danger' : 
                                product.stockQuantity <= (product.minStockLevel || 10) / 2 ? 'bg-danger' :
                                'bg-warning'
                              }`}>
                                {product.stockQuantity} adet
                              </span>
                              <small className="text-muted">
                                Min: {product.minStockLevel || 10}
                              </small>
                            </div>
                            {product.stockQuantity === 0 && (
                              <small className="text-danger d-block mt-1">
                                <i className="fas fa-exclamation-circle me-1"></i>
                                Stok Tükendi!
                              </small>
                            )}
                            {product.stockQuantity > 0 && product.stockQuantity <= (product.minStockLevel || 10) && (
                              <small className="text-warning d-block mt-1">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Kritik Seviye
                              </small>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-3">
                    <Button 
                      variant="warning" 
                      className="stock-warning-btn"
                      onClick={() => navigate('/products')}
                    >
                      <i className="fas fa-eye me-2"></i>
                      Tüm Ürünleri Görüntüle
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default Dashboard;
