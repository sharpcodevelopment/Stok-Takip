import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import './Dashboard.css';

const StockRequestManagement = () => {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [adminRequests, setAdminRequests] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchRequests();
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

  const fetchRequests = async () => {
    try {
      const response = await api.get('/stockrequests');
      setRequests(response.data || []);
    } catch (error) {
      console.error('Stok talepleri alınamadı:', error);
      setRequests([]);
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

  const handleApprove = async (requestId) => {
    setLoading(true);
    try {
      await api.put(`/stockrequests/${requestId}/approve`);
      fetchRequests();
      fetchPendingRequests();
    } catch (error) {
      console.error('Onay hatası:', error);
      alert('Onay işlemi sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectionReason.trim()) {
      alert('Red nedeni belirtmelisiniz.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/stockrequests/${requestId}/reject`, {
        reason: rejectionReason
      });
      fetchRequests();
      fetchPendingRequests();
      setShowModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Red hatası:', error);
      alert('Red işlemi sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Bekliyor</Badge>;
      case 'approved':
        return <Badge bg="success">Onaylandı</Badge>;
      case 'rejected':
        return <Badge bg="danger">Reddedildi</Badge>;
      default:
        return <Badge bg="secondary">Bilinmiyor</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">Yüksek</Badge>;
      case 'medium':
        return <Badge bg="warning">Orta</Badge>;
      case 'low':
        return <Badge bg="info">Düşük</Badge>;
      default:
        return <Badge bg="secondary">Bilinmiyor</Badge>;
    }
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={adminRequests} />

      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-clipboard-list me-2"></i>Stok Talepleri Yönetimi</h2>
                <p className="text-muted">Mağaza çalışanlarının stok taleplerini onaylayın veya reddedin</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Info Alert */}
        <Alert variant="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Stok Talepleri:</strong> Mağaza çalışanlarının oluşturduğu talepleri inceleyin ve onaylayın/reddedin.
        </Alert>

        {/* Requests Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Tüm Talepler ({requests.length} talep)
            </h5>
          </Card.Header>
          <Card.Body>
            {requests.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover className="stock-requests-table">
                  <thead>
                    <tr>
                      <th>Talep Eden</th>
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
                          <strong>{request.requestedByName}</strong>
                        </td>
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
                          {(() => {
                            const date = new Date(request.createdAt);
                            return date.toLocaleString('tr-TR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                          })()}
                        </td>
                        <td>
                          {request.notes && (
                            <div className="text-muted small">{request.notes}</div>
                          )}
                        </td>
                        <td>
                          {/* Sadece reddedilmişse reddetme sebebini göster */}
                          {request.status === 'rejected' && request.rejectionReason ? (
                            <div className="small">
                              {request.rejectionReason}
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {request.status === 'pending' && (
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={loading}
                              >
                                <i className="fas fa-check me-1"></i>
                                Onayla
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => openRejectModal(request)}
                                disabled={loading}
                              >
                                <i className="fas fa-times me-1"></i>
                                Reddet
                              </Button>
                            </div>
                          )}
                          {request.status !== 'pending' && (
                            <small className="text-muted">
                              {request.approvedByName && (
                                <div>
                                  {request.status === 'rejected' ? 'Reddeden' : 'Onaylayan'}: {request.approvedByName}
                                </div>
                              )}
                            </small>
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
                <h5>Henüz talep bulunmuyor</h5>
                <p className="text-muted">
                  Mağaza çalışanları henüz stok talebi oluşturmamış.
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Reject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-times-circle text-danger me-2"></i>
            Stok Talebini Reddet
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Reddetme Sebebi *</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Talebi neden reddettiğinizi açıklayın..."
                required
              />
                             <Form.Text style={{color: '#343a40', fontWeight: '500'}}>
                 Bu sebep mağaza çalışanına gösterilecektir.
               </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <i className="fas fa-times me-1"></i>
            İptal
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleReject(selectedRequest?.id)}
            disabled={loading || !rejectionReason.trim()}
          >
            <i className="fas fa-times-circle me-1"></i>
            {loading ? 'Reddediliyor...' : 'Reddet'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StockRequestManagement;
