import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import './Dashboard.css';

const AdminRequests = () => {
  const [user, setUser] = useState(null);
  const [adminRequests, setAdminRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchAdminRequests();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
      
      // Admin rolü kontrolü
      const userRole = response.data?.user_metadata?.role;
      if (userRole !== 'admin') {
        setError('Bu sayfaya erişim yetkiniz bulunmuyor.');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
      setError('Kullanıcı bilgileri alınamadı.');
    }
  };

  const fetchAdminRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/admin-requests');
      setAdminRequests(response.data || []);
    } catch (error) {
      console.error('Admin talepleri alınamadı:', error);
      setError('Admin talepleri alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const handleReject = async (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequest) return;

    try {
      setIsApproving(true);
      const approvalData = {
        userId: selectedRequest.id,
        isApproved: !rejectionReason, // Eğer rejection reason varsa reddediliyor
        rejectionReason: rejectionReason || null
      };

      await api.post('/auth/approve-admin', approvalData);
      
      // Listeyi yenile
      await fetchAdminRequests();
      
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      alert(approvalData.isApproved ? 'Kullanıcı admin olarak onaylandı.' : 'Admin talebi reddedildi.');
    } catch (error) {
      console.error('Onay işlemi başarısız:', error);
      alert('Onay işlemi sırasında hata oluştu.');
    } finally {
      setIsApproving(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul'
    });
  };

  if (error) {
    return (
      <div className="dashboard-container">
        <AdminNavbar user={user} />
        <Container>
          <Alert variant="danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        </Container>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} />

      <Container>
        <Row className="mb-4">
          <Col>
            <div className="welcome-section">
              <h1 className="welcome-title">
                <i className="fas fa-user-shield me-3"></i>
                Admin Onay Talepleri
              </h1>
              <p className="welcome-subtitle">
                Kullanıcıların admin olma taleplerini yönetin
              </p>
            </div>
          </Col>
        </Row>

        {loading ? (
          <Row>
            <Col>
              <Card className="text-center p-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Yükleniyor...</span>
                </div>
                <p className="mt-3">Admin talepleri yükleniyor...</p>
              </Card>
            </Col>
          </Row>
        ) : adminRequests.length === 0 ? (
          <Row>
            <Col>
              <Card className="text-center p-4">
                <i className="fas fa-check-circle text-success" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3">Bekleyen Admin Talebi Yok</h4>
                <p className="text-muted">Şu anda onay bekleyen admin talebi bulunmuyor.</p>
              </Card>
            </Col>
          </Row>
        ) : (
          <Row>
            {adminRequests.map((request) => (
              <Col key={request.id} xs={12} md={6} lg={4} className="mb-3">
                <Card className="h-100">
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">
                        <i className="fas fa-user me-2"></i>
                        {request.firstName} {request.lastName}
                      </h6>
                      <Badge bg="warning">Beklemede</Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-2">
                      <strong>Email:</strong> {request.email}
                    </div>
                    <div className="mb-2">
                      <strong>Telefon:</strong> {request.phoneNumber || 'Belirtilmemiş'}
                    </div>
                    <div className="mb-3">
                      <strong>Talep Tarihi:</strong> {formatDate(request.adminRequestDate)}
                    </div>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="success" 
                        size="sm"
                        onClick={() => handleApprove(request)}
                      >
                        <i className="fas fa-check me-2"></i>
                        Onayla
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleReject(request)}
                      >
                        <i className="fas fa-times me-2"></i>
                        Reddet
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>

      {/* Onay/Red Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {rejectionReason ? 'Admin Talebini Reddet' : 'Admin Talebini Onayla'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p>
                <strong>{selectedRequest.firstName} {selectedRequest.lastName}</strong> 
                ({selectedRequest.email}) kullanıcısının admin olma talebini 
                {rejectionReason ? ' reddetmek' : ' onaylamak'} istediğinizden emin misiniz?
              </p>
              
              {rejectionReason && (
                <Form.Group className="mb-3">
                  <Form.Label>Red Nedeni (Opsiyonel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Red nedeni yazabilirsiniz..."
                  />
                </Form.Group>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            İptal
          </Button>
          <Button 
            variant={rejectionReason ? "danger" : "success"}
            onClick={handleApprovalSubmit}
            disabled={isApproving}
          >
            {isApproving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                İşleniyor...
              </>
            ) : (
              <>
                <i className={`fas fa-${rejectionReason ? 'times' : 'check'} me-2`}></i>
                {rejectionReason ? 'Reddet' : 'Onayla'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminRequests;
