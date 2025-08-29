import React from 'react';
import { Navbar, Nav, Dropdown, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminNavbar = ({ user, pendingRequests = 0, adminRequests = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Kullanıcı bilgilerini debug et
  console.log('AdminNavbar - Kullanıcı bilgileri:', user);
  console.log('AdminNavbar - Kullanıcı firstName:', user?.firstName);
  console.log('AdminNavbar - Kullanıcı lastName:', user?.lastName);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar 
      expand="lg" 
      className="shadow-lg mb-4" 
      style={{
        background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 0 20px 20px'
      }}
    >
      <Container>
        <Navbar.Brand className="fw-bold" style={{fontSize: '1.4rem'}}>
          <span 
            className="me-2" 
            style={{
              fontSize: '1.6rem', 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            🏢
          </span>
          <span className="text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>Yönetici</span>
          <span className="text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}> Paneli</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => navigate('/dashboard')} 
              className={`position-relative ${isActive('/dashboard') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/products')} 
              className={`position-relative ${isActive('/products') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-box me-2"></i>
              Ürünler
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/categories')} 
              className={`position-relative ${isActive('/categories') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-tags me-2"></i>
              Kategoriler
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/transactions')} 
              className={`position-relative ${isActive('/transactions') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-exchange-alt me-2"></i>
              Stok Hareketleri
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/admin-requests')} 
              className={`position-relative ${isActive('/admin-requests') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-user-shield me-2"></i>
              Admin Talepleri
              {adminRequests > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {adminRequests}
                </span>
              )}
            </Nav.Link>
            <Nav.Link 
              onClick={() => navigate('/stock-requests')} 
              className={`position-relative ${isActive('/stock-requests') ? 'active' : ''}`}
              style={{
                color: '#e9ecef',
                fontWeight: '500',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                borderRadius: '8px',
                margin: '0 6px',
                padding: '12px 20px'
              }}
            >
              <i className="fas fa-clipboard-list me-2"></i>
              Stok Talepleri
              {pendingRequests > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {pendingRequests}
                </span>
              )}
            </Nav.Link>
          </Nav>
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="outline-light" 
                id="admin-dropdown"
                className="border-0 d-flex align-items-center admin-dropdown-toggle"
                style={{
                  borderRadius: '25px', 
                  padding: '8px 16px',
                  color: '#ffffff',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'translateY(0)'
                }}
              >
                <div 
                  className="me-2 d-flex align-items-center justify-content-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <i className="fas fa-user-shield text-white" style={{fontSize: '14px'}}></i>
                </div>
                                 <div className="text-start d-none d-sm-block">
                   <div style={{fontSize: '14px', color: '#ffffff', fontWeight: '500'}}>
                     {user?.user_metadata?.firstName || user?.firstName || 'Admin'} {user?.user_metadata?.lastName || user?.lastName || 'Kullanıcı'}
                   </div>
                   <div style={{fontSize: '12px', color: '#e9ecef', opacity: '0.9'}}>
                     {user?.user_metadata?.role === 'admin' ? 'Sistem Yöneticisi' : 'Mağaza Çalışanı'}
                   </div>
                 </div>
              </Dropdown.Toggle>

              <Dropdown.Menu 
                className="shadow border-0" 
                style={{
                  borderRadius: '12px', 
                  minWidth: '160px',
                  zIndex: 99999,
                  marginTop: '8px',
                  position: 'absolute'
                }}
              >
                <Dropdown.Header className="text-muted small px-3 py-1">
                  <i className="fas fa-user-shield me-2"></i>
                  Yönetici
                </Dropdown.Header>
                
                <Dropdown.Item onClick={() => navigate('/profile')} className="px-3 py-1" style={{fontSize: '14px'}}>
                  <i className="fas fa-user me-2 text-primary"></i>
                  Profil
                </Dropdown.Item>
                
                <Dropdown.Divider className="my-1" />
                
                <Dropdown.Item onClick={handleLogout} className="px-3 py-1 text-danger" style={{fontSize: '14px'}}>
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Çıkış
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
