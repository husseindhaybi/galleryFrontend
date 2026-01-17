import axios from 'axios';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/admin/check', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setIsAdmin(response.data.is_admin === true);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#64748b'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;