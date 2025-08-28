import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import AdminNavbar from './AdminNavbar.jsx';
import { formatDateForDisplay } from '../utils/dateUtils.js';
import './Dashboard.css';

const Products = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [adminRequests, setAdminRequests] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
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

  const fetchAdminRequests = async () => {
    try {
      const response = await api.get('/auth/admin-requests');
      setAdminRequests(response.data?.length || 0);
    } catch (error) {
      console.error('Admin talepleri alınamadı:', error);
      setAdminRequests(0);
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

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Kategori Yok';
  };

  const getStockStatus = (quantity, minLevel = 10) => {
    if (quantity <= 0) {
      return <Badge bg="danger">Stok Yok</Badge>;
    } else if (quantity <= minLevel) {
      return <Badge bg="warning">Düşük Stok</Badge>;
    } else {
      return <Badge bg="success">Stokta</Badge>;
    }
  };



  return (
    <div className="dashboard-container">
      <AdminNavbar user={user} pendingRequests={pendingRequests} adminRequests={adminRequests} />

      <Container>
        <Row className="mb-4">
          <Col>
            <div>
              <h2><i className="fas fa-box me-2"></i>Ürün Stok Durumu</h2>
              <p className="text-muted">Sistem ürünlerinin mevcut stok durumlarını görüntüleyin</p>
            </div>
          </Col>
        </Row>

        <Card>
          <Card.Body>
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Ürün Adı</th>
                  <th className="d-none d-md-table-cell">Açıklama</th>
                  <th>Kategori</th>
                  <th className="d-none d-sm-table-cell">Fiyat</th>
                  <th>Stok Miktarı</th>
                  <th>Stok Durumu</th>
                  <th className="d-none d-lg-table-cell">Beden</th>
                  <th className="d-none d-lg-table-cell">Renk</th>
                  <th className="d-none d-md-table-cell">Son Güncelleme/Oluşturma</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td><strong>{product.name}</strong></td>
                    <td className="d-none d-md-table-cell">{product.description}</td>
                    <td>{getCategoryName(product.categoryId)}</td>
                    <td className="d-none d-sm-table-cell">₺{product.price}</td>
                    <td>
                      <span className="fw-bold">{product.stockQuantity}</span>
                    </td>
                    <td>{getStockStatus(product.stockQuantity, product.minStockLevel)}</td>
                    <td className="d-none d-lg-table-cell">{product.size || '-'}</td>
                    <td className="d-none d-lg-table-cell">{product.color || '-'}</td>
                    <td className="d-none d-md-table-cell">
                                              {product.updatedAt ? 
                          (() => {
                            try {
                              const date = new Date(product.updatedAt);
                              if (isNaN(date.getTime())) {
                                return '-';
                              }
                              return formatDateForDisplay(date);
                            } catch (error) {
                              return '-';
                            }
                          })() : 
                          (product.createdAt ? 
                            (() => {
                              try {
                                const date = new Date(product.createdAt);
                                if (isNaN(date.getTime())) {
                                  return '-';
                                }
                                return formatDateForDisplay(date);
                              } catch (error) {
                                return '-';
                              }
                            })() : '-'
                          )
                        }
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Products;

