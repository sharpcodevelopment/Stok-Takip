import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const EmployeeHeader = ({ activeMenu = 'dashboard' }) => {
  const [user, setUser] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      // Kullanıcı bilgileri alınamadı
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNavLinkClick = () => {
    setIsExpanded(false);
  };

  const getMenuClass = (menuName) => {
    return activeMenu === menuName ? 'text-white fw-semibold me-3' : 'fw-semibold me-3';
  };

  const getMenuStyle = (menuName) => {
    if (activeMenu === menuName) {
      return {
        color: '#ffffff', 
        fontSize: '1.1rem',
        padding: '12px 20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0)',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      };
    } else {
      return {
        color: '#adb5bd', 
        fontSize: '1.1rem',
        padding: '12px 20px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateY(0)'
      };
    }
  };

  return (
    <Navbar 
      expand="lg" 
      className={`employee-header shadow-lg mb-4 ${isExpanded ? 'expanded' : ''}`}
      expanded={isExpanded}
      onToggle={handleToggle}
      style={{
        background: 'linear-gradient(135deg, #343a40 0%, #495057 100%)',
        borderBottom: '3px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '0 0 20px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        transition: 'none'
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
            🏪
          </span>
          <span className="text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>Mağaza</span>
          <span className="text-white" style={{textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}> Paneli</span>
        </Navbar.Brand>
        
        <Navbar.Toggle 
          aria-controls="employee-navbar-nav"
          style={{
            border: 'none',
            padding: '8px 12px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            transition: 'all 0.3s ease'
          }}
        />
        
        <Navbar.Collapse 
          id="employee-navbar-nav"
        >
          {/* Ana Menü */}
          <Nav className="me-auto flex-column flex-lg-row" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <Nav.Link 
              onClick={() => {
                navigate('/user-dashboard');
                handleNavLinkClick();
              }}
              className={getMenuClass('dashboard')}
              style={{...getMenuStyle('dashboard'), borderRadius: '8px', marginBottom: '0.5rem'}}
              onMouseEnter={(e) => {
                if (activeMenu !== 'dashboard') {
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-0.5px)';
                  e.target.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'dashboard') {
                  e.target.style.color = '#adb5bd';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.textShadow = 'none';
                }
              }}
            >
              <i className="fas fa-home me-2"></i>
              <span className="d-lg-inline">Ana Sayfa</span>
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => {
                navigate('/user-products');
                handleNavLinkClick();
              }}
              className={getMenuClass('products')}
              style={{...getMenuStyle('products'), borderRadius: '8px', marginBottom: '0.5rem'}}
              onMouseEnter={(e) => {
                if (activeMenu !== 'products') {
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-0.5px)';
                  e.target.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'products') {
                  e.target.style.color = '#adb5bd';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.textShadow = 'none';
                }
              }}
            >
              <i className="fas fa-boxes me-2"></i>
              <span className="d-lg-inline">Ürün Kataloğu</span>
            </Nav.Link>
            
            <Nav.Link 
              onClick={() => {
                navigate('/user-requests');
                handleNavLinkClick();
              }}
              className={getMenuClass('requests')}
              style={{...getMenuStyle('requests'), borderRadius: '8px', marginBottom: '0.5rem'}}
              onMouseEnter={(e) => {
                if (activeMenu !== 'requests') {
                  e.target.style.color = '#ffffff';
                  e.target.style.transform = 'translateY(-0.5px)';
                  e.target.style.textShadow = '0 1px 2px rgba(0,0,0,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'requests') {
                  e.target.style.color = '#adb5bd';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.textShadow = 'none';
                }
              }}
            >
              <i className="fas fa-plus-square me-2"></i>
              <span className="d-lg-inline">Talep Oluştur</span>
            </Nav.Link>
          </Nav>

          {/* Sağ Taraf - Kullanıcı Bilgileri */}
          <Nav className="align-items-center" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            {/* Kullanıcı Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle 
                variant="outline-light" 
                id="user-dropdown"
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
                  className="rounded-circle d-flex align-items-center justify-content-center me-2" 
                  style={{
                    width: '32px', 
                    height: '32px',
                    background: 'linear-gradient(135deg, #495057 0%, #6c757d 100%)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <i className="fas fa-user text-white" style={{fontSize: '14px'}}></i>
                </div>
                <div className="text-start">
                  <div className="fw-semibold" style={{fontSize: '14px'}}>
                    {user?.user_metadata?.firstName || user?.firstName || user?.first_name || 'Kullanıcı'} {user?.user_metadata?.lastName || user?.lastName || user?.last_name || ''}
                  </div>
                  <div style={{fontSize: '12px', color: '#ffffff', opacity: '0.8'}}>
                    Mağaza Çalışanı
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
                
                <Dropdown.Item onClick={() => navigate('/user-profile')} className="px-3 py-1" style={{fontSize: '14px'}}>
                  <i className="fas fa-user-edit me-2 text-primary"></i>
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

export default EmployeeHeader;
