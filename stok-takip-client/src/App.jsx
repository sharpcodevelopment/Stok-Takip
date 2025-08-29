import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import UserProducts from './components/UserProducts.jsx';
import UserProductDetail from './components/UserProductDetail.jsx';
import UserRequests from './components/UserRequests.jsx';
import Products from './components/Products.jsx';
import Categories from './components/Categories.jsx';
import StockTransactions from './components/StockTransactions.jsx';
import UserManagement from './components/UserManagement.jsx';
import StockRequestManagement from './components/StockRequestManagement.jsx';
import AdminRequests from './components/AdminRequests.jsx';
import { authAPI } from './services/api.js';
import './App.css';

const LoadingSpinner = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #1a1d23 0%, #2c3e50 50%, #34495e 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999
  }}>
    <div style={{
      textAlign: 'center',
      color: 'white'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTop: '3px solid #ffffff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <h4 style={{ margin: 0, color: '#ffffff' }}>Yükleniyor...</h4>
      <p style={{ margin: '10px 0 0 0', color: '#adb5bd' }}>Stok Takip Sistemi</p>
    </div>
  </div>
);

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const session = localStorage.getItem('session');
  
  // Token (eski sistem) veya Supabase session kontrolü
  return (token || (user && session)) ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const session = localStorage.getItem('session');
  
  if (!(token || (user && session))) return <Navigate to="/login" />;
  
  // Rol kontrolü - sadece admin'ler erişebilir
  if (!authAPI.isAdmin()) {
    return <Navigate to="/user-dashboard" />;
  }
  
  return children;
};

const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const session = localStorage.getItem('session');
  
  if (!(token || (user && session))) return <Navigate to="/login" />;
  
  // Rol kontrolü - sadece user'lar erişebilir (admin'ler user dashboard'a giremez)
  if (!authAPI.isUser()) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mobilde güvenilir loading kontrolü
    const handleLoad = () => {
      setIsLoading(false);
    };

    // Sayfa zaten yüklendiyse hemen başlat
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      // Sayfa yüklenme olayını dinle
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router data-testid="router">
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/products" element={<AdminRoute><Products /></AdminRoute>} />
          <Route path="/categories" element={<AdminRoute><Categories /></AdminRoute>} />
          <Route path="/transactions" element={<AdminRoute><StockTransactions /></AdminRoute>} />
          <Route path="/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
          <Route path="/admin-requests" element={<AdminRoute><AdminRequests /></AdminRoute>} />
          <Route path="/stock-requests" element={<AdminRoute><StockRequestManagement /></AdminRoute>} />
          
          {/* User Routes */}
          <Route path="/user-dashboard" element={<UserRoute><UserDashboard /></UserRoute>} />
          <Route path="/user-products" element={<UserRoute><UserProducts /></UserRoute>} />
          <Route path="/user-product-detail/:id" element={<UserRoute><UserProductDetail /></UserRoute>} />
          <Route path="/user-requests" element={<UserRoute><UserRequests /></UserRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
