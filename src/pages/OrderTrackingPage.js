import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingForm, setTrackingForm] = useState({
    order_id: searchParams.get('order_id') || '',
    email: searchParams.get('email') || ''
  });

  useEffect(() => {
    
    if (trackingForm.order_id && trackingForm.email) {
      handleTrackOrder();
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTrackingForm({
      ...trackingForm,
      [name]: value
    });
  };

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();

    if (!trackingForm.order_id || !trackingForm.email) {
      setError('Please enter both Order ID and Email');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axios.get(
        `/api/orders/track/${trackingForm.order_id}?email=${trackingForm.email}`
      );

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to track order');
    } finally {
      setLoading(false);
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

  const getStatusText = (status) => {
    const texts = {
      pending: 'Order Pending',
      processing: 'Processing Order',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
      cancelled: 'Order Cancelled'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isStepCompleted = (step) => {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order?.status);
    const stepIndex = statusOrder.indexOf(step);
    return currentIndex >= stepIndex && order?.status !== 'cancelled';
  };

  return (
    <div className="order-tracking-page">
    
      <div className="bg-primary bg-gradient text-white py-4 mb-4">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="display-5 fw-bold mb-2">
                <i className="bi bi-geo-alt me-2"></i>
                Track Your Order
              </h1>
              <p className="lead mb-0">Enter your order details to track your delivery</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-5">
     
        <div className="row justify-content-center mb-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <form onSubmit={handleTrackOrder}>
                  <div className="row g-3">
                    <div className="col-md-5">
                      <label htmlFor="orderId" className="form-label fw-semibold">
                        <i className="bi bi-hash me-1"></i>
                        Order ID
                      </label>
                      <input
                        type="number"
                        id="orderId"
                        name="order_id"
                        className="form-control"
                        value={trackingForm.order_id}
                        onChange={handleInputChange}
                        placeholder="Enter your order ID"
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label htmlFor="email" className="form-label fw-semibold">
                        <i className="bi bi-envelope me-1"></i>
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={trackingForm.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div className="col-md-2 d-flex align-items-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary w-100"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Tracking...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-1"></i>
                            Track
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

                {error && (
                  <div className="alert alert-danger mt-3 mb-0" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      
        {order && (
          <div className="row justify-content-center">
            <div className="col-lg-10">
          
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-4">
                    <div className={`rounded-circle ${getStatusBadge(order.status)} p-3 me-3`} style={{ width: '60px', height: '60px' }}>
                      <i className={`bi ${getStatusIcon(order.status)} fs-3`}></i>
                    </div>
                    <div>
                      <h3 className="mb-1 fw-bold">{getStatusText(order.status)}</h3>
                      <p className="text-muted mb-0">Order #{order.order_id}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {order.status !== 'cancelled' && (
                    <div className="position-relative">
                      <div className="d-flex justify-content-between align-items-start">
                       
                        <div className="text-center" style={{ flex: 1 }}>
                          <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isStepCompleted('pending') ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-clock-history fs-5"></i>
                          </div>
                          <small className="fw-semibold d-block">Order Placed</small>
                          <small className="text-muted">{formatDate(order.order_date)}</small>
                        </div>

                      
                        <div className="text-center" style={{ flex: 1 }}>
                          <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isStepCompleted('processing') ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-arrow-repeat fs-5"></i>
                          </div>
                          <small className="fw-semibold d-block">Processing</small>
                          <small className="text-muted">
                            {order.status === 'pending' ? 'Pending' : 'In Progress'}
                          </small>
                        </div>

                      
                        <div className="text-center" style={{ flex: 1 }}>
                          <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isStepCompleted('shipped') ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-truck fs-5"></i>
                          </div>
                          <small className="fw-semibold d-block">Shipped</small>
                          <small className="text-muted">
                            {['shipped', 'delivered'].includes(order.status) ? 'On the way' : 'Not yet shipped'}
                          </small>
                        </div>

                      
                        <div className="text-center" style={{ flex: 1 }}>
                          <div className={`rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center ${isStepCompleted('delivered') ? 'bg-success text-white' : 'bg-light text-muted'}`} style={{ width: '50px', height: '50px' }}>
                            <i className="bi bi-check-circle-fill fs-5"></i>
                          </div>
                          <small className="fw-semibold d-block">Delivered</small>
                          <small className="text-muted">
                            {order.status === 'delivered' ? 'Completed' : 'Pending'}
                          </small>
                        </div>
                      </div>

                      <div className="position-absolute top-0 start-0 w-100" style={{ height: '50px', zIndex: -1 }}>
                        <div className="h-100 d-flex align-items-center px-5">
                          <div className="w-100 bg-light" style={{ height: '3px' }}>
                            <div 
                              className="bg-success h-100 transition-all" 
                              style={{ 
                                width: `${
                                  order.status === 'pending' ? '0%' :
                                  order.status === 'processing' ? '33%' :
                                  order.status === 'shipped' ? '66%' :
                                  order.status === 'delivered' ? '100%' : '0%'
                                }`,
                                transition: 'width 0.5s ease'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

            
                  {order.status === 'cancelled' && (
                    <div className="alert alert-danger mt-3" role="alert">
                      <i className="bi bi-x-circle-fill me-2"></i>
                      This order has been cancelled
                    </div>
                  )}
                </div>
              </div>

            
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-3">
                        <i className="bi bi-person-circle me-2 text-primary"></i>
                        Customer Information
                      </h5>
                      <p className="mb-2">
                        <strong>Name:</strong><br/>
                        {order.full_name}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong><br/>
                        {order.email}
                      </p>
                      <p className="mb-0">
                        <strong>Phone:</strong><br/>
                        {order.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-3">
                        <i className="bi bi-geo-alt me-2 text-primary"></i>
                        Shipping Address
                      </h5>
                      <p className="mb-0">{order.shipping_address}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <h5 className="card-title fw-bold mb-3">
                        <i className="bi bi-credit-card me-2 text-primary"></i>
                        Payment Information
                      </h5>
                      <p className="mb-2">
                        <strong>Method:</strong><br/>
                        {order.payment_method}
                      </p>
                      <p className="mb-2">
                        <strong>Status:</strong><br/>
                        <span className={`badge ${getStatusBadge(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                      </p>
                      <p className="mb-0">
                        <strong>Total Amount:</strong><br/>
                        <span className="fs-4 fw-bold text-primary">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

       
              <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0 fw-bold">
                    <i className="bi bi-box-seam me-2"></i>
                    Order Items
                  </h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" style={{ width: '80px' }}>Image</th>
                          <th scope="col">Product</th>
                          <th scope="col" className="text-center">Quantity</th>
                          <th scope="col" className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items && order.items.map(item => (
                          <tr key={item.order_item_id}>
                            <td>
                              <img 
                                src={item.image_url ? `${item.image_url}` : 'https://via.placeholder.com/60?text=No+Image'}
                                alt={item.product_name}
                                className="rounded"
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  objectFit: 'cover',
                                  border: '1px solid #dee2e6'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                                }}
                              />
                            </td>
                            <td>
                              <strong>{item.product_name}</strong>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-secondary">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="text-end fw-bold">
                              ${item.subtotal.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colspan="3" className="text-end fw-bold">Total:</td>
                          <td className="text-end">
                            <span className="fs-5 fw-bold text-primary">
                              ${order.total_amount.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>

    
              {order.payment_method === 'Cash on Delivery' && 
               !['delivered', 'cancelled'].includes(order.status) && (
                <div className="alert alert-warning border-0 shadow-sm" role="alert">
                  <h5 className="alert-heading">
                    <i className="bi bi-cash-coin me-2"></i>
                    Payment Reminder
                  </h5>
                  <p className="mb-2">
                    Please prepare <strong className="fs-5">${order.total_amount.toFixed(2)}</strong> in cash for when the delivery arrives.
                  </p>
                  <hr/>
                  <p className="mb-0 small">
                    <i className="bi bi-telephone me-1"></i>
                    Our delivery team will contact you before arrival.
                  </p>
                </div>
              )}

          
              <div className="card shadow-sm border-0">
                <div className="card-body text-center p-4">
                  <h5 className="mb-3">Need help with your order?</h5>
                  <button className="btn btn-outline-primary">
                    <i className="bi bi-headset me-2"></i>
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;