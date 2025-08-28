import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.js';
import EmployeeHeader from './EmployeeHeader.jsx';
import './Dashboard.css';

const UserProductDetail = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchUserProfile();
    fetchProductDetail();
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Ürün detayları alınamadı:', error);
      setError('Ürün detayları yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stockQuantity, minStockLevel) => {
    if (stockQuantity <= 0) {
      return { variant: 'danger', text: 'Stokta Yok' };
    } else if (stockQuantity <= minStockLevel) {
      return { variant: 'warning', text: 'Kritik Seviye' };
    } else {
      return { variant: 'success', text: 'Stokta' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <EmployeeHeader activeMenu="products" />
        <Container>
          <div className="text-center py-5">
            <Spinner animation="border" role="status" className="mb-3">
              <span className="visually-hidden">Yükleniyor...</span>
            </Spinner>
            <h5>Ürün detayları yükleniyor...</h5>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="dashboard-container">
        <EmployeeHeader activeMenu="products" />
        <Container>
          <Alert variant="danger" className="mt-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error || 'Ürün bulunamadı.'}
          </Alert>
          <Button variant="outline-primary" onClick={() => navigate('/user-products')}>
            <i className="fas fa-arrow-left me-2"></i>
            Ürün Listesine Dön
          </Button>
        </Container>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stockQuantity, product.minStockLevel);

  return (
    <div className="dashboard-container">
      <EmployeeHeader activeMenu="products" />

      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-box me-2"></i>Ürün Detayları</h2>
                <p className="text-muted">Ürün hakkında detaylı bilgileri görüntüleyin</p>
              </div>
              <Button variant="outline-primary" onClick={() => navigate('/user-products')}>
                <i className="fas fa-arrow-left me-2"></i>
                Geri Dön
              </Button>
            </div>
          </Col>
        </Row>

        {/* Info Alert */}
        <Alert variant="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Mağaza Çalışanı:</strong> Sadece görüntüleme yetkiniz bulunmaktadır.
        </Alert>

        {/* Product Details */}
        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Ürün Bilgileri
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Ürün Adı:</strong>
                      <div className="text-muted">{product.name}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Açıklama:</strong>
                      <div className="text-muted">{product.description || 'Açıklama yok'}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Kategori:</strong>
                      <div className="text-muted">{product.categoryName || 'Kategori belirtilmemiş'}</div>
                    </div>
                    <div className="mb-3">
                      <strong>Fiyat:</strong>
                      <div className="text-muted">
                        <strong>{product.price?.toLocaleString('tr-TR')} ₺</strong>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="mb-3">
                      <strong>Stok Durumu:</strong>
                      <div>
                        <Badge bg={stockStatus.variant} className="me-2">
                          {stockStatus.text}
                        </Badge>
                        <span className="text-muted">({product.stockQuantity} adet)</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Minimum Stok Seviyesi:</strong>
                      <div className="text-muted">{product.minStockLevel} adet</div>
                    </div>
                    <div className="mb-3">
                      <strong>Barkod:</strong>
                      <div className="text-muted">
                        {product.barcode ? (
                          <code>{product.barcode}</code>
                        ) : (
                          'Barkod belirtilmemiş'
                        )}
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Durum:</strong>
                      <div>
                        <Badge bg={product.isActive ? 'success' : 'secondary'}>
                          {product.isActive ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Additional Details */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-tags me-2"></i>
                  Ek Bilgiler
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Marka:</strong>
                  <div className="text-muted">{product.brand || 'Belirtilmemiş'}</div>
                </div>
                <div className="mb-3">
                  <strong>Model:</strong>
                  <div className="text-muted">{product.model || 'Belirtilmemiş'}</div>
                </div>
                <div className="mb-3">
                  <strong>Beden:</strong>
                  <div className="text-muted">{product.size || 'Belirtilmemiş'}</div>
                </div>
                <div className="mb-3">
                  <strong>Renk:</strong>
                  <div className="text-muted">{product.color || 'Belirtilmemiş'}</div>
                </div>
              </Card.Body>
            </Card>

            {/* Timestamps */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Zaman Bilgileri
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong>Oluşturulma Tarihi:</strong>
                  <div className="text-muted">{formatDate(product.createdAt)}</div>
                </div>
                <div className="mb-3">
                  <strong>Son Güncelleme:</strong>
                  <div className="text-muted">{formatDate(product.updatedAt)}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default UserProductDetail;
