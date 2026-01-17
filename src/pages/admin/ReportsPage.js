import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartLine, FaDollarSign, FaShoppingCart } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';
import './ReportsPage.css';

const ReportsPage = () => {
  const [timeFrame, setTimeFrame] = useState('today'); 
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    total_revenue: 0,
    orders_by_status: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [timeFrame]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      

      const response = await axios.get(
        `/api/admin/reports?timeframe=${timeFrame}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setStats(response.data.stats || {});
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeFrameLabel = () => {
    switch(timeFrame) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Loading reports...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="reports-page">
        <div className="page-header">
          <div>
            <h1> Sales Reports</h1>
            <p>Track your sales performance</p>
          </div>
        </div>


        <div className="timeframe-selector">
          <button
            className={`timeframe-btn ${timeFrame === 'today' ? 'active' : ''}`}
            onClick={() => setTimeFrame('today')}
          >
            Today
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFrame('week')}
          >
            This Week
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFrame('month')}
          >
            This Month
          </button>
          <button
            className={`timeframe-btn ${timeFrame === 'year' ? 'active' : ''}`}
            onClick={() => setTimeFrame('year')}
          >
            This Year
          </button>
        </div>

   
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">
              <FaDollarSign />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Revenue</p>
              <h2 className="stat-value">{formatCurrency(stats.total_revenue)}</h2>
              <span className="stat-period">{getTimeFrameLabel()}</span>
            </div>
          </div>

          <div className="stat-card orders">
            <div className="stat-icon">
              <FaShoppingCart />
            </div>
            <div className="stat-content">
              <p className="stat-label">Total Orders</p>
              <h2 className="stat-value">{stats.total_orders || 0}</h2>
              <span className="stat-period">{getTimeFrameLabel()}</span>
            </div>
          </div>

          <div className="stat-card avg-order">
            <div className="stat-icon">
              <FaChartLine />
            </div>
            <div className="stat-content">
              <p className="stat-label">Average Order</p>
              <h2 className="stat-value">
                {formatCurrency(
                  stats.total_orders > 0
                    ? stats.total_revenue / stats.total_orders
                    : 0
                )}
              </h2>
              <span className="stat-period">{getTimeFrameLabel()}</span>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">
              <FaCalendarAlt />
            </div>
            <div className="stat-content">
              <p className="stat-label">Completed Orders</p>
              <h2 className="stat-value">
                {stats.orders_by_status?.find(s => s.status === 'delivered')?.count || 0}
              </h2>
              <span className="stat-period">{getTimeFrameLabel()}</span>
            </div>
          </div>
        </div>

       
        {stats.orders_by_status && stats.orders_by_status.length > 0 && (
          <div className="status-breakdown">
            <h3>Orders by Status</h3>
            <div className="status-grid">
              {stats.orders_by_status.map(item => (
                <div key={item.status} className={`status-card status-${item.status}`}>
                  <div className="status-label">{item.status}</div>
                  <div className="status-count">{item.count}</div>
                  <div className="status-revenue">{formatCurrency(item.revenue)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      
        <div className="recent-orders-section">
          <h3>Recent Orders - {getTimeFrameLabel()}</h3>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders found for {getTimeFrameLabel().toLowerCase()}</p>
            </div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.order_id}>
                      <td>#{order.order_id}</td>
                      <td>{order.username}</td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="amount">{formatCurrency(order.total_amount)}</td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <span className={`payment-badge payment-${order.payment_status}`}>
                          {order.payment_status}
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

export default ReportsPage;