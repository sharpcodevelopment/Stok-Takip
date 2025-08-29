import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import { formatDateForDisplay, getRelativeTimeString } from '../utils/dateUtils.js';
import './Dashboard.css';

const UserManagement = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/auth/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('API hatası detayı:', error.response?.status, error.response?.data);
      console.error('Kullanıcılar alınamadı:', error.message);
      // API çalışmıyorsa mock data kullan
      const mockUsers = [
        {
          id: 1,
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@stoktakip.com',
          roles: ['Admin'],
          isSuperAdmin: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          firstName: 'Çalışan',
          lastName: 'Test',
          email: 'calisan@stoktakip.com',
          roles: ['Employee'],
          isSuperAdmin: false,
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          firstName: 'Demo',
          lastName: 'Kullanıcı',
          email: 'demo@stoktakip.com',
          roles: ['Employee'],
          isSuperAdmin: false,
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      setUsers(mockUsers);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const response = await api.get('/auth/admin-requests');
      setAdminRequests(response.data || []);
    } catch (error) {
      console.error('Admin talepleri alınamadı:', error);
      setAdminRequests([]);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMakeAdmin = async (userId) => {
    setLoading(true);
    try {
      await api.post(`/auth/make-admin/${userId}`);
      fetchUsers(); // Listeyi yenile
    } catch (error) {
      console.error('Admin yapma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (userId) => {
    setLoading(true);
    try {
      await api.post(`/auth/remove-admin/${userId}`);
      fetchUsers(); // Listeyi yenile
    } catch (error) {
      console.error('Admin kaldırma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (isApproved) => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await api.post('/auth/approve-admin', {
        userId: selectedRequest.id,
        isApproved: isApproved,
        rejectionReason: !isApproved ? rejectionReason : null
      });
      
      // Listeleri yenile
      fetchUsers();
      fetchAdminRequests();
      
      // Modal'ı kapat
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      
      // Başarı mesajı
      alert(isApproved ? 'Kullanıcı admin olarak onaylandı!' : 'Admin olma talebi reddedildi!');
    } catch (error) {
      console.error('Admin onay/red hatası:', error);
      alert('İşlem sırasında hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const getRoleBadge = (roles, isSuperAdmin) => {
    if (isSuperAdmin) {
      return <Badge bg="warning">Ana Admin</Badge>;
    }
    if (Array.isArray(roles)) {
      return roles.includes('Admin') ? 
        <Badge bg="danger">Admin</Badge> : 
        <Badge bg="primary">Çalışan</Badge>;
    }
    return roles === 'Admin' ? 
      <Badge bg="danger">Admin</Badge> : 
      <Badge bg="primary">Çalışan</Badge>;
  };

  const getAdminRequestStatus = (user) => {
    if (user.isAdminRequestPending) {
      return <Badge bg="warning">Onay Bekliyor</Badge>;
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={adminRequests.length} />

      <Container>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2><i className="fas fa-users me-2"></i>Kullanıcı Yönetimi</h2>
                <p className="text-muted">Sistem kullanıcılarını yönetin ve yetkilerini düzenleyin</p>
              </div>
            </div>
          </Col>
        </Row>

        {/* Info Alert */}
        <Alert variant="info" className="mb-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>Kullanıcı Yönetimi:</strong> {user?.isSuperAdmin ? 
            'Ana admin olarak tüm kullanıcıları yönetebilir ve admin yetkilerini düzenleyebilirsiniz.' : 
            'Kullanıcı listesini görüntüleyebilirsiniz. Admin işlemleri sadece ana admin tarafından yapılabilir.'
          }
        </Alert>

        {/* Admin Onay Talepleri - Sadece SuperAdmin görebilir */}
        {user?.isSuperAdmin && adminRequests.length > 0 && (
          <Card className="mb-4 border-warning">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="fas fa-clock me-2"></i>
                Admin Onay Talepleri ({adminRequests.length} talep)
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Email</th>
                      <th>Telefon</th>
                      <th>Talep Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminRequests.map(request => (
                      <tr key={request.id}>
                        <td>
                          <strong>{request.firstName} {request.lastName}</strong>
                        </td>
                        <td>{request.email}</td>
                        <td>{request.phoneNumber || '-'}</td>
                        <td>
                          {formatDateForDisplay(request.adminRequestDate)}
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openApprovalModal(request)}
                              disabled={loading}
                            >
                              <i className="fas fa-check me-1"></i>
                              Onayla
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openApprovalModal(request)}
                              disabled={loading}
                            >
                              <i className="fas fa-times me-1"></i>
                              Reddet
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Users Table */}
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              Kullanıcılar ({users.length} kullanıcı)
            </h5>
          </Card.Header>
          <Card.Body>
            {users.length > 0 ? (
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Ad Soyad</th>
                      <th>Email</th>
                      <th>Telefon</th>
                      <th>Rol</th>
                      <th>Admin Durumu</th>
                      <th>Kayıt Tarihi</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(userItem => (
                      <tr key={userItem.id}>
                        <td>
                          <strong>{userItem.firstName} {userItem.lastName}</strong>
                        </td>
                        <td>{userItem.email}</td>
                        <td>{userItem.phoneNumber || '-'}</td>
                        <td>{getRoleBadge(userItem.roles, userItem.isSuperAdmin)}</td>
                        <td>{getAdminRequestStatus(userItem)}</td>
                        <td>
                          {formatDateForDisplay(userItem.createdAt)}
                        </td>
                        <td>
                          {user?.isSuperAdmin ? (
                            userItem.isSuperAdmin ? (
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled={true}
                                title="Ana admin"
                              >
                                <i className="fas fa-crown me-1"></i>
                                Ana Admin
                              </Button>
                            ) : !userItem.roles?.includes('Admin') ? (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleMakeAdmin(userItem.id)}
                                disabled={loading}
                              >
                                <i className="fas fa-user-shield me-1"></i>
                                Admin Yap
                              </Button>
                            ) : (
                              userItem.id === user?.id ? (
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  disabled={true}
                                  title="Kendi admin rolünüzü kaldıramazsınız"
                                >
                                  <i className="fas fa-lock me-1"></i>
                                  Admin (Sen)
                                </Button>
                              ) : (
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleRemoveAdmin(userItem.id)}
                                  disabled={loading}
                                >
                                  <i className="fas fa-user-times me-1"></i>
                                  Admin Kaldır
                                </Button>
                              )
                            )
                          ) : (
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              disabled={true}
                              title="Sadece ana admin bu işlemi yapabilir"
                            >
                              <i className="fas fa-ban me-1"></i>
                              Yetki Yok
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-users fa-3x text-muted mb-3"></i>
                <h5>Henüz kullanıcı bulunmuyor</h5>
                <p className="text-muted">
                  Sistemde kayıtlı kullanıcı bulunmuyor.
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Admin Onay/Red Modal */}
      <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-user-shield me-2"></i>
            Admin Onay İşlemi
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <p><strong>Kullanıcı:</strong> {selectedRequest.firstName} {selectedRequest.lastName}</p>
              <p><strong>Email:</strong> {selectedRequest.email}</p>
              
              <div className="mt-3">
                <Form.Group>
                  <Form.Label>Red Nedeni (Opsiyonel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Red nedeni yazabilirsiniz..."
                  />
                </Form.Group>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
            İptal
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleApproveAdmin(false)}
            disabled={loading}
          >
            <i className="fas fa-times me-1"></i>
            Reddet
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleApproveAdmin(true)}
            disabled={loading}
          >
            <i className="fas fa-check me-1"></i>
            Onayla
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;
