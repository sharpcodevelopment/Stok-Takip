import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import { formatDateForDisplay } from '../utils/dateUtils.js';
import './Dashboard.css';

const Categories = () => {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingRequests, setPendingRequests] = useState(0);
  const [adminRequests, setAdminRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
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
    try {
      if (editingCategory) {
        // Update category
        
        const response = await api.put(`/categories/${editingCategory.id}`, formData);
        
        setSuccess('Kategori başarıyla güncellendi');
      } else {
        // Add new category
        await api.post('/categories', formData);
        setSuccess('Kategori başarıyla eklendi');
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('API hatası:', error);
      setError('İşlem sırasında hata oluştu');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await api.delete(`/categories/${id}`);
        setSuccess('Kategori başarıyla silindi');
        fetchCategories();
      } catch (error) {
        console.error('API hatası:', error);
        setError('Silme işlemi sırasında hata oluştu');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/auth/refresh-token');
      localStorage.setItem('token', response.data.token);
      return true;
    } catch (error) {
      console.error('Token yenileme hatası:', error);
      return false;
    }
  };

  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={adminRequests} />

      <Container>
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2><i className="fas fa-tags me-2"></i>Kategoriler</h2>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                <i className="fas fa-plus me-2"></i>Yeni Kategori Ekle
              </Button>
            </div>
          </Col>
        </Row>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Card>
          <Card.Body>
            <Table responsive striped hover className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                                     <th>Kategori Adı</th>
                   <th>Açıklama</th>
                   <th>Ürün Sayısı</th>
                   <th>Oluşturma Tarihi</th>
                   <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.description}</td>
                     <td>
                       <span className="badge bg-info">{category.productCount || 0}</span>
                     </td>
                     <td>
                       {formatDateForDisplay(category.createdAt)}
                     </td>
                     <td>
                       <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEdit(category)}>
                         <i className="fas fa-edit"></i>
                       </Button>
                       <Button size="sm" variant="outline-danger" onClick={() => handleDelete(category.id)}>
                         <i className="fas fa-trash"></i>
                       </Button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Kategori Adı</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              İptal
            </Button>
            <Button variant="primary" type="submit">
              {editingCategory ? 'Güncelle' : 'Ekle'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
