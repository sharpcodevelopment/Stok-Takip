import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import EmployeeHeader from './EmployeeHeader.jsx';
import './Dashboard.css';

const UserRequests = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    priority: 'normal',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    quantity: '',
    priority: 'normal',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchProducts();
    fetchRequests();
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
    try {
      const response = await api.get('/products');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Ürünler alınamadı:', error);
      setProducts([]);
    }
  };

  const fetchRequests = async () => {
    try {
      // Bu endpoint'i backend'te oluşturmanız gerekecek
      const response = await api.get('/stockrequests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Talepler alınamadı:', error);
      setRequests([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/stockrequests', {
        ...formData,
        requestedById: user.id
      });

      setShowModal(false);
      setFormData({ productId: '', quantity: '', priority: 'normal', notes: '' });
      fetchRequests();
    } catch (error) {
      console.error('Talep oluşturulamadı:', error);
      console.error('Hata detayları:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setEditFormData({
      quantity: request.quantity,
      priority: request.priority,
      notes: request.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/stockrequests/${editingRequest.id}`, {
        quantity: parseInt(editFormData.quantity),
        priority: editFormData.priority,
        notes: editFormData.notes
      });

      setShowEditModal(false);
      setEditingRequest(null);
      setEditFormData({ quantity: '', priority: 'normal', notes: '' });
      fetchRequests();
      alert('Talep başarıyla güncellendi!');
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Talep güncellenirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Bu talebi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/stockrequests/${requestId}`);
      fetchRequests();
      alert('Talep başarıyla iptal edildi!');
    } catch (error) {
      console.error('İptal hatası:', error);
      alert('Talep iptal edilirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'secondary',
      normal: 'primary',
      high: 'warning',
      urgent: 'danger'
    };
    return <Badge bg={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="dashboard-container">
      {/* Modern Navigation Bar */}
      <EmployeeHeader activeMenu="requests" />

      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-clipboard-list me-2"></i>Stok Talepleri</h2>
                <p className="text-muted">Stok taleplerinizi oluşturun ve takip edin</p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setShowModal(true)}
              >
                <i className="fas fa-plus me-2"></i>
                Yeni Talep
              </Button>
            </div>
          </Col>
        </Row>

                 {/* Info Alert */}
         <Alert variant="info" className="mb-4">
           <i className="fas fa-info-circle me-2"></i>
           <strong>Stok Talepleri:</strong> Mağazada ihtiyaç duyduğunuz ürünler için talep oluşturabilirsiniz. 
           Admin onayından sonra stok girişi yapılacaktır.
         </Alert>

        {/* Requests Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Taleplerim ({requests.length} talep)
            </h5>
          </Card.Header>
          <Card.Body>
            {requests.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover className="user-requests-table">
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Miktar</th>
                      <th>Öncelik</th>
                      <th>Durum</th>
                      <th>Tarih</th>
                      <th>Notlar</th>
                      <th>Reddetme Sebebi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.productName}</strong>
                          <div className="text-muted small">{request.productBrand}</div>
                        </td>
                        <td>
                          <strong>{request.quantity} adet</strong>
                        </td>
                        <td>{getPriorityBadge(request.priority)}</td>
                        <td>{getStatusBadge(request.status)}</td>
                                                 <td>
                           {new Date(request.createdAt).toLocaleString('tr-TR', {
                             year: 'numeric',
                             month: '2-digit',
                             day: '2-digit',
                             timeZone: 'Europe/Istanbul'
                           })}
                           <div className="text-muted small">
                             {new Date(request.createdAt).toLocaleString('tr-TR', {
                               hour: '2-digit',
                               minute: '2-digit',
                               timeZone: 'Europe/Istanbul'
                             })}
                           </div>
                         </td>
                        <td>
                          {request.notes && (
                            <div className="text-muted small">{request.notes}</div>
                          )}
                        </td>
                        <td>
                          {/* Sadece reddetme mesajını göster */}
                          {request.status === 'rejected' && request.rejectionReason ? (
                            <div className="small">
                              {request.rejectionReason}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {/* İşlemler - Sadece bekleyen talepler için */}
                          {request.status === 'pending' ? (
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleEditRequest(request)}
                                title="Talebi Düzenle"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleCancelRequest(request.id)}
                                title="Talebi İptal Et"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
                <h5>Henüz talep oluşturmadınız</h5>
                <p className="text-muted">
                  Mağazada ihtiyaç duyduğunuz ürünler için yeni talep oluşturabilirsiniz.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  İlk Talebinizi Oluşturun
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* New Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-plus me-2"></i>
            Yeni Stok Talebi
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-box me-2"></i>Ürün</Form.Label>
                  <Form.Select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Ürün seçin...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.brand} (Stok: {product.stockQuantity})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-sort-numeric-up me-2"></i>Miktar</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Talep edilen miktar"
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-exclamation-triangle me-2"></i>Öncelik</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Düşük</option>
                    <option value="normal">Normal</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label><i className="fas fa-sticky-note me-2"></i>Notlar</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Talep hakkında ek notlar..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <i className="fas fa-plus me-2"></i>
                  Talep Oluştur
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Request Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-edit me-2"></i>
            Talebi Düzenle
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateRequest}>
          <Modal.Body>
            {editingRequest && (
              <>
                <div className="mb-3 p-3 bg-light rounded">
                  <strong>Ürün:</strong> {editingRequest.productName} - {editingRequest.productBrand}
                </div>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-sort-numeric-up me-2"></i>Miktar</Form.Label>
                      <Form.Control
                        type="number"
                        name="quantity"
                        value={editFormData.quantity}
                        onChange={handleEditChange}
                        placeholder="Talep edilen miktar"
                        min="1"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label><i className="fas fa-exclamation-triangle me-2"></i>Öncelik</Form.Label>
                      <Form.Select
                        name="priority"
                        value={editFormData.priority}
                        onChange={handleEditChange}
                      >
                        <option value="low">Düşük</option>
                        <option value="normal">Normal</option>
                        <option value="high">Yüksek</option>
                        <option value="urgent">Acil</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-sticky-note me-2"></i>Notlar</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={editFormData.notes}
                    onChange={handleEditChange}
                    placeholder="Talep hakkında ek notlar..."
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              İptal
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Güncelle
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserRequests;
