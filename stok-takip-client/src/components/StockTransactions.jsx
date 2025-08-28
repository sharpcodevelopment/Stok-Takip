import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import './Dashboard.css';

const StockTransactions = () => {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState('in');
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    description: '',
    // Yeni ürün için alanlar
    name: '',
    productDescription: '',
    categoryId: '',
    price: '',
    size: '',
    color: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [adminRequests, setAdminRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchTransactions();
    fetchProducts();
    fetchCategories();
    fetchPendingRequests();
    fetchAdminRequests();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/stocktransactions');
      
      // API response'u kontrol et ve doğru array'i al
      let transactionsData = [];
      if (response.data && Array.isArray(response.data)) {
        transactionsData = response.data;
      } else if (response.data && response.data.transactions && Array.isArray(response.data.transactions)) {
        transactionsData = response.data.transactions;
      } else if (response.data && typeof response.data === 'object') {
        // Eğer object ise, içindeki array'i bul
        const keys = Object.keys(response.data);
        for (const key of keys) {
          if (Array.isArray(response.data[key])) {
            transactionsData = response.data[key];
            break;
          }
        }
      }
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Stok hareketleri alınamadı:', error);
      setTransactions([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      
      // API response'u kontrol et ve doğru array'i al
      let productsData = [];
      if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response.data && response.data.products && Array.isArray(response.data.products)) {
        productsData = response.data.products;
      } else if (response.data && typeof response.data === 'object') {
        // Eğer object ise, içindeki array'i bul
        const keys = Object.keys(response.data);
        for (const key of keys) {
          if (Array.isArray(response.data[key])) {
            productsData = response.data[key];
            break;
          }
        }
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Ürünler alınamadı:', error);
      setProducts([]);
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

  const fetchPendingRequests = async () => {
    try {
      const response = await api.get('/stockrequests');
      const requests = response.data || [];
      const pendingCount = requests.filter(request => request.status === 'pending').length;
      setPendingRequests(pendingCount);
    } catch (error) {
      console.error('Bekleyen talepler alınamadı:', error);
      setPendingRequests(0);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const response = await api.get('/auth/admin-requests');
      setAdminRequests(response.data?.length || 0);
    } catch (error) {
      console.error('Admin talepleri alınamadı:', error);
      setAdminRequests(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (transactionType === 'in') {
        // Stok girişi - yeni ürün oluştur veya mevcut ürünü güncelle
        let productId = formData.productId;
        
        if (!productId) {
          // Yeni ürün oluştur
          const newProduct = {
            name: formData.name,
            description: formData.productDescription,
            categoryId: parseInt(formData.categoryId),
            price: parseFloat(formData.price),
            stockQuantity: parseInt(formData.quantity),
            minStockLevel: 10,
            size: formData.size,
            color: formData.color
          };
          
          const productResponse = await api.post('/products', newProduct);
          productId = productResponse.data.id;
        } else {
          // Mevcut ürünün stok miktarını güncelle
          const existingProduct = products.find(p => p.id === parseInt(productId));
          if (existingProduct) {
            const updatedProduct = {
              ...existingProduct,
              stockQuantity: existingProduct.stockQuantity + parseInt(formData.quantity)
            };
            await api.put(`/products/${productId}`, updatedProduct);
          }
        }

        // Stok giriş işlemini kaydet
        const transactionData = {
          productId: parseInt(productId),
          transactionType: 0, // Giriş
          quantity: parseInt(formData.quantity),
          unitPrice: 0,
          notes: formData.description
        };
        
        await api.post('/stocktransactions', transactionData);
        setSuccess('Stok girişi başarıyla kaydedildi');
      } else {
        // Stok çıkışı - sadece mevcut ürün
        const transactionData = {
          productId: parseInt(formData.productId),
          transactionType: 1, // Çıkış
          quantity: parseInt(formData.quantity),
          unitPrice: 0,
          notes: formData.description
        };
        
        await api.post('/stocktransactions', transactionData);
        setSuccess('Stok çıkışı başarıyla kaydedildi');
      }

      setShowModal(false);
      resetForm();
      fetchTransactions();
      fetchProducts();
      
      localStorage.setItem('dashboardNeedsUpdate', 'true');
    } catch (error) {
      console.error('İşlem hatası:', error);
      setError('İşlem sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      description: '',
      name: '',
      productDescription: '',
      categoryId: '',
      price: '',
      size: '',
      color: ''
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
    setError('');
    setSuccess('');
  };

  const getTransactionTypeBadge = (type) => {
    switch (type) {
      case 'in':
      case 0:
        return <Badge bg="success">Giriş</Badge>;
      case 'out':
      case 1:
        return <Badge bg="danger">Çıkış</Badge>;
      case 'adjustment':
        return <Badge bg="warning">Düzeltme</Badge>;
      default:
        return <Badge bg="secondary">Bilinmiyor</Badge>;
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Bilinmeyen Ürün';
  };



  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={adminRequests} />

      <Container>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-exchange-alt me-2"></i>Stok Hareketleri</h2>
                <p className="text-muted">Stok giriş ve çıkış işlemlerini takip edin</p>
              </div>
              <div>
                <Button variant="success" className="me-2" onClick={() => { setTransactionType('in'); setShowModal(true); }}>
                  <i className="fas fa-plus me-2"></i>Stok Girişi
                </Button>
                <Button variant="warning" onClick={() => { setTransactionType('out'); setShowModal(true); }}>
                  <i className="fas fa-minus me-2"></i>Stok Çıkışı
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card>
          <Card.Body>
            <Table responsive striped hover className="stock-transactions-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ürün</th>
                  <th>Tip</th>
                  <th>Miktar</th>
                  <th>Açıklama</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{getProductName(transaction.productId)}</td>
                    <td>{getTransactionTypeBadge(transaction.transactionType)}</td>
                    <td>
                      <span className="fw-bold">{transaction.quantity}</span>
                    </td>
                    <td>{transaction.notes || transaction.description}</td>
                    <td>
                      {transaction.transactionDate || transaction.date ? 
                        new Date(transaction.transactionDate || transaction.date).toLocaleString('tr-TR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add Transaction Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Stok {transactionType === 'in' ? 'Girişi' : 'Çıkışı'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {transactionType === 'in' ? (
              // Stok Girişi - Yeni ürün veya mevcut ürün
              <>
                <Form.Group className="mb-3">
                  <Form.Label style={{color: '#343a40', fontWeight: '600'}}>Ürün Seçimi</Form.Label>
                  <Form.Select
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  >
                    <option value="">Yeni Ürün Ekle</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Mevcut: {product.stockQuantity})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted" >
                    Yeni ürün eklemek için "Yeni Ürün Ekle" seçin, mevcut ürünün stok miktarını artırmak için ürün seçin
                  </Form.Text>
                </Form.Group>

                {!formData.productId && (
                  // Yeni ürün formu
                  <>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{color: '#343a40', fontWeight: '600'}}>Ürün Adı *</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required={!formData.productId}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{color: '#343a40', fontWeight: '600'}}>Kategori *</Form.Label>
                          <Form.Select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                            required={!formData.productId}
                          >
                            <option value="">Kategori Seçin</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.id}>
                                {category.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Ürün Açıklaması</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        value={formData.productDescription}
                        onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Fiyat (₺) *</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                            required={!formData.productId}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Beden</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.size}
                            onChange={(e) => setFormData({...formData, size: e.target.value})}
                            placeholder="Örn: 42-46, S-XXL"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Renk</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.color}
                            onChange={(e) => setFormData({...formData, color: e.target.value})}
                            placeholder="Örn: Beyaz, Siyah"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            ) : (
              // Stok Çıkışı - Sadece mevcut ürünler
              <Form.Group className="mb-3">
                <Form.Label>Ürün *</Form.Label>
                <Form.Select
                  value={formData.productId}
                  onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  required
                >
                  <option value="">Ürün Seçin</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Mevcut: {product.stockQuantity})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Miktar *</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>İşlem Açıklaması</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="İşlem açıklaması..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              İptal
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StockTransactions;
