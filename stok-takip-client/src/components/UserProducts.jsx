import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Table, Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import EmployeeHeader from './EmployeeHeader.jsx';
import './Dashboard.css';

const UserProducts = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Ürünler alınamadı:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Kategoriler alınamadı:', error);
      setCategories([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (quantity, minimumLevel) => {
    if (quantity <= 0) return { variant: 'danger', text: 'Stok Yok' };
    if (quantity <= minimumLevel) return { variant: 'warning', text: 'Düşük Stok' };
    return { variant: 'success', text: 'Stokta' };
  };

  return (
    <div className="dashboard-container">
      {/* Modern Navigation Bar */}
      <EmployeeHeader activeMenu="products" />

      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-search me-2"></i>Stok Sorgulama</h2>
                <p className="text-muted">Ürün stok durumlarını sorgulayabilirsiniz</p>
              </div>
                             <Alert variant="info" className="mb-0">
                 <i className="fas fa-info-circle me-2"></i>
                 <strong>Mağaza Çalışanı:</strong> Sadece görüntüleme yetkiniz bulunmaktadır.
               </Alert>
            </div>
          </Col>
        </Row>

        {/* Search Filters */}
        <Row className="mb-4">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label><i className="fas fa-search me-2"></i>Arama</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Ürün adı, marka veya barkod ile arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <i className="fas fa-search"></i>
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label><i className="fas fa-tags me-2"></i>Kategori</Form.Label>
              <Form.Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Products Table */}
        <Card>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-box me-2"></i>
                Ürün Listesi ({filteredProducts.length} ürün)
              </h5>
              {loading && (
                <div>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Yükleniyor...
                </div>
              )}
            </div>
          </Card.Header>
          <Card.Body>
            {filteredProducts.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Ürün Adı</th>
                      <th className="d-none d-md-table-cell">Marka/Model</th>
                      <th className="d-none d-sm-table-cell">Kategori</th>
                      <th className="d-none d-lg-table-cell">Barkod</th>
                      <th>Stok Durumu</th>
                      <th className="d-none d-sm-table-cell">Fiyat</th>
                      <th>Detay</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product.stockQuantity, product.minimumStockLevel);
                      return (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            {product.description && (
                              <div className="text-muted small">{product.description}</div>
                            )}
                          </td>
                          <td className="d-none d-md-table-cell">
                            {product.brand && <div>{product.brand}</div>}
                            {product.model && <div className="text-muted small">{product.model}</div>}
                          </td>
                          <td className="d-none d-sm-table-cell">{product.categoryName}</td>
                          <td className="d-none d-lg-table-cell">
                            {product.barcode && (
                              <code className="small">{product.barcode}</code>
                            )}
                          </td>
                          <td>
                            <Badge bg={stockStatus.variant}>
                              {stockStatus.text}
                            </Badge>
                            <div className="small text-muted mt-1">
                              {product.stockQuantity} adet
                            </div>
                          </td>
                          <td className="d-none d-sm-table-cell">
                            <strong>{product.price?.toLocaleString('tr-TR')} ₺</strong>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/user-product-detail/${product.id}`)}
                            >
                              <i className="fas fa-eye me-1"></i>
                              Detay
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>Ürün bulunamadı</h5>
                <p className="text-muted">
                  {searchTerm || selectedCategory 
                    ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
                    : 'Henüz ürün eklenmemiş.'
                  }
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default UserProducts;
