import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(response.data.orders || []);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancellingOrder(orderId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
  icon: 'success',
  title: 'Order Cancelled',
  text: 'Order cancelled successfully!',
  confirmButtonText: 'OK'
});

      loadOrders();
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Cancel Failed',
  text: error.response?.data?.error || 'Failed to cancel order',
  confirmButtonText: 'OK'
});

    } finally {
      setCancellingOrder(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      processing: 'bg-info text-white',
      shipped: 'bg-primary',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'bi-clock-history',
      processing: 'bi-arrow-repeat',
      shipped: 'bi-truck',
      delivered: 'bi-check-circle-fill',
      cancelled: 'bi-x-circle-fill'
    };
    return icons[status] || 'bi-info-circle';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="orders-page">
     
      <div
        className="text-white py-4 mb-4"
        style={{
          background: 'linear-gradient(135deg, #D2B48C 0%, #C4A484 100%)',

        }}
      >
        <div className="container d-flex justify-content-between align-items-center">
          <h1 className="fw-bold mb-0">
            <i className="bi bi-bag-check me-2"></i>
            My Orders
          </h1>
          <span className="badge bg-white text-primary fs-6">
            {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
          </span>
        </div>
      </div>

      <div className="container mb-5">
        {orders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-bag-x text-muted" style={{ fontSize: '5rem' }}></i>
            <h3 className="mt-3 text-muted">No orders yet</h3>
            <p className="text-muted">Start shopping to see your orders here!</p>
            <button onClick={() => navigate('/products')} className="btn btn-nut-brown btn-lg" style={{ color: '#fff' }}>
              <i className="bi bi-shop me-2"></i>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {orders.map(order => (
              <div key={order.order_id} className="col-12">
                <div className="card shadow-lg border-0 rounded-4">
                
                  <div
                    className="card-header text-white"
                    style={{
                      background: 'linear-gradient(135deg, #D2B48C 0%, #C4A484 100%)',

                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                      <div>
                        <h5 className="fw-bold mb-1">
                          <i className="bi bi-receipt me-2"></i>
                          Order #{order.order_id}
                        </h5>
                        <small>
                          {new Date(order.order_date).toLocaleDateString()}
                        </small>
                      </div>
                      <span className={`badge ${getStatusBadge(order.status)} px-3 py-2 fs-6`}>
                        <i className={`bi ${getStatusIcon(order.status)} me-1`}></i>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                   
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted">Total Amount</small>
                          <h4 className="fw-bold text-primary">
                            ${Number(order.total_amount).toFixed(2)}
                          </h4>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted">Payment Method </small>
                          <strong>{order.payment_method}</strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded">
                          <small className="text-muted">Payment Status </small>
                          <strong className="text-capitalize">{order.payment_status}</strong>
                        </div>
                      </div>
                    </div>

                    
                    {order.items?.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Image</th>
                              <th>Product</th>
                              <th className="text-center">Qty</th>
                              <th className="text-end">Price</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map(item => (
                              <tr key={item.order_item_id}>
                                <td>
                                  <img
                                    src={
                                      item.image_url
                                        ? `${item.image_url}`
                                        : 'https://via.placeholder.com/50'
                                    }
                                    alt={item.product_name}
                                    width="50"
                                    height="50"
                                    className="rounded border"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </td>
                                <td>{item.product_name}</td>
                                <td className="text-center">
                                  <span className="badge bg-secondary">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="text-end">
                                  ${Number(item.price_at_purchase).toFixed(2)}
                                </td>
                                <td className="text-end fw-bold">
                                  ${(item.quantity * item.price_at_purchase).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                   
                    {order.status === 'pending' && (
                      <div className="mt-4 text-end">
                        <button
                          onClick={() => handleCancelOrder(order.order_id)}
                          disabled={cancellingOrder === order.order_id}
                          className="btn btn-outline-danger fw-semibold"
                        >
                          {cancellingOrder === order.order_id
                            ? 'Cancelling...'
                            : 'Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
