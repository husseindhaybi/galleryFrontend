import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  FaBox,
  FaDollarSign,
  FaShoppingCart,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadStats();
    loadRecentOrders();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/orders?limit=5', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRecentOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'pending': 'bg-warning text-dark',
      'processing': 'bg-info text-white',
      'shipped': 'bg-primary text-white',
      'delivered': 'bg-success text-white',
      'cancelled': 'bg-danger text-white'
    };
    return statusMap[status?.toLowerCase()] || 'bg-secondary text-white';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h3 mb-1 fw-bold">Dashboard</h1>
          <p className="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <button 
          className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
          onClick={() => navigate('/admin/products/add')}
        >
          <span>➕</span>
          <span>Add Product</span>
        </button>
      </div>

      
      <div className="row g-3 mb-4">
      
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#e3f2fd'
                  }}
                >
                  <FaBox className="text-primary fs-4" />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Total Products
                  </p>
                  <h3 className="h4 fw-bold mb-0">{stats.total_products}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

   
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#d1fae5'
                  }}
                >
                  <FaShoppingCart className="text-success fs-4" />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Total Orders
                  </p>
                  <h3 className="h4 fw-bold mb-0">{stats.total_orders}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

  
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#ede9fe'
                  }}
                >
                  <FaUsers className="text-purple fs-4" style={{ color: '#8b5cf6' }} />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Total Users
                  </p>
                  <h3 className="h4 fw-bold mb-0">{stats.total_users}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

      
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '56px',
                    height: '56px',
                    backgroundColor: '#fef3c7'
                  }}
                >
                  <FaDollarSign className="text-warning fs-4" />
                </div>
                <div className="flex-grow-1">
                  <p className="text-muted small mb-1 text-uppercase" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    Total Revenue
                  </p>
                  <h3 className="h4 fw-bold mb-0">${Number(stats.total_revenue).toFixed(2)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="h5 mb-0 fw-bold">Recent Orders</h2>
            <button 
              className="btn btn-link text-decoration-none p-0 fw-semibold"
              onClick={() => navigate('/admin/orders')}
            >
              View All →
            </button>
          </div>
        </div>
        
        <div className="card-body p-0">
          {recentOrders.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No orders yet</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 text-nowrap">Order ID</th>
                    <th className="py-3 text-nowrap">Customer</th>
                    <th className="py-3 text-nowrap d-none d-md-table-cell">Date</th>
                    <th className="py-3 text-nowrap">Total</th>
                    <th className="py-3 text-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.order_id}>
                      <td className="px-4 py-3 fw-bold text-nowrap">#{order.order_id}</td>
                      <td className="py-3">
                        <div className="text-truncate" style={{ maxWidth: '150px' }}>
                          {order.username || order.guest_email || 'Guest'}
                        </div>
                      </td>
                      <td className="py-3 text-muted text-nowrap d-none d-md-table-cell">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 fw-bold text-success text-nowrap">
                        ${Number(order.total_amount).toFixed(2)}
                      </td>
                      <td className="py-3">
                        <span className={`badge ${getStatusBadgeClass(order.status)} text-nowrap`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      
    </AdminLayout>
  );
};

export default AdminDashboard;