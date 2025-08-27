import React, { useState, useEffect } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const AdminDropdown = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgileri alınamadı:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="outline-light" 
        id="admin-dropdown"
        className="border-0 d-flex align-items-center"
        style={{
          borderRadius: '25px', 
          padding: '8px 16px',
          color: '#ffffff',
          fontWeight: '600'
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
          <i className="fas fa-user-shield text-white" style={{fontSize: '14px'}}></i>
        </div>
        <div className="text-start d-none d-md-block">
          <div style={{fontSize: '14px'}}>
            {user?.firstName || 'Admin'} {user?.lastName || 'Kullanıcı'}
          </div>
          <div className="text-muted" style={{fontSize: '12px'}}>
            Sistem Yöneticisi
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
          <i className="fas fa-user-cog me-2 text-primary"></i>
          Profil
        </Dropdown.Item>
        
        <Dropdown.Item onClick={() => navigate('/dashboard')} className="px-3 py-1" style={{fontSize: '14px'}}>
          <i className="fas fa-tachometer-alt me-2 text-success"></i>
          Dashboard
        </Dropdown.Item>
        
        <Dropdown.Divider className="my-1" />
        
        <Dropdown.Item onClick={handleLogout} className="px-3 py-1 text-danger" style={{fontSize: '14px'}}>
          <i className="fas fa-sign-out-alt me-2"></i>
          Çıkış
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminDropdown;
