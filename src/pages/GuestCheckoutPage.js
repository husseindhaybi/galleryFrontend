import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const GuestCheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadCartFromLocalStorage();
  }, []);

  const loadCartFromLocalStorage = () => {

    const savedCart = localStorage.getItem('guestCart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      setCartItems(cart);
    } else {

      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Your cart is empty',
        confirmButtonText: 'OK'
      });
      navigate('/products');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }

    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'Shipping address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Empty Cart',
        text: 'Your cart is empty',
        confirmButtonText: 'OK'
      });
      return;
    }

    setLoading(true);

    try {

      const orderCartItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));


      const fullAddress = `${formData.shipping_address}, ${formData.city}${formData.notes ? '\nNotes: ' + formData.notes : ''}`;

    
      const response = await axios.post('/api/orders/guest-checkout', {
        username: formData.username,
        password: formData.password,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        shipping_address: fullAddress,
        cart_items: orderCartItems
      });

      if (response.data.success) {
   
        localStorage.removeItem('guestCart');
 
        await Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `
            <p><strong>Order ID:</strong> ${response.data.order_id}</p>
            <p><strong>Total:</strong> $${response.data.total_amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
            <hr>
            <p class="text-success"><strong>✅ Account Created!</strong></p>
            <p>Username: <strong>${response.data.username}</strong></p>
            <p>You can now login to track your orders!</p>
            <hr>
            <p>Confirmation email sent to <strong>${formData.email}</strong></p>
          `,
          confirmButtonText: 'Go to Login',
          showCancelButton: true,
          cancelButtonText: 'Track Order'
        });


        if (Swal.getConfirmButton().clicked) {
          navigate('/login');
        } else {
          navigate(`/track-order?order_id=${response.data.order_id}&email=${formData.email}`);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Order Failed',
        text: error.response?.data?.error || 'Failed to place order. Please try again.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(item => item.product_id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.product_id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
  };

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-4 fw-bold text-center">Guest Checkout</h1>
          <p className="text-center text-muted lead">Complete your order - Payment on Delivery</p>
        </div>
      </div>

      <div className="row g-4">
  
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              {cartItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-cart-x" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="order-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {cartItems.map(item => (
                      <div key={item.product_id} className="card mb-3 border">
                        <div className="row g-0 align-items-center">
                          <div className="col-3">
                            <img 
                              src={item.image_url || '/placeholder.jpg'} 
                              alt={item.product_name}
                              className="img-fluid rounded-start"
                              style={{ maxHeight: '80px', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="col-9">
                            <div className="card-body p-2">
                              <h6 className="card-title mb-1">{item.product_name}</h6>
                              <p className="text-muted small mb-2">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="btn-group btn-group-sm">
                                  <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                  >
                                    -
                                  </button>
                                  <button className="btn btn-outline-secondary" disabled>
                                    {item.quantity}
                                  </button>
                                  <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                  >
                                    +
                                  </button>
                                </div>
                                <div>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => removeItem(item.product_id)}
                                  >
                                    Remove
                                  </button>
                                  <strong className="ms-3">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr />

                  <div className="order-total">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span className="fw-bold">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span className="text-success fw-bold">FREE</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between mb-3">
                      <span className="h5">Total:</span>
                      <span className="h5 text-primary fw-bold">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="alert alert-info mb-0">
                      <strong>💵 Payment Method:</strong> Cash on Delivery
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

   
        <div className="col-lg-7">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Create Account & Shipping Info</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
          
                <div className="border-bottom pb-3 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-person-plus-fill me-2"></i>
                    Account Information
                  </h6>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Username <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                      />
                      {errors.username && (
                        <div className="invalid-feedback">{errors.username}</div>
                      )}
                      <small className="text-muted">You'll use this to login later</small>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Choose a password"
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>
                      <small className="text-muted">Min. 6 characters</small>
                    </div>
                  </div>
                </div>

    
                <div className="border-bottom pb-3 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-person-fill me-2"></i>
                    Personal Information
                  </h6>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">{errors.full_name}</div>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+961 71874503"
                      />
                      {errors.phone && (
                        <div className="invalid-feedback">{errors.phone}</div>
                      )}
                    </div>
                  </div>
                </div>

      
                <div className="pb-3 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Shipping Address
                  </h6>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      name="shipping_address"
                      className={`form-control ${errors.shipping_address ? 'is-invalid' : ''}`}
                      value={formData.shipping_address}
                      onChange={handleChange}
                      placeholder="Street address, building number, apartment..."
                      rows="3"
                    />
                    {errors.shipping_address && (
                      <div className="invalid-feedback">{errors.shipping_address}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter your city"
                    />
                    {errors.city && (
                      <div className="invalid-feedback">{errors.city}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      className="form-control"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Any special instructions for delivery?"
                      rows="2"
                    />
                  </div>
                </div>

                <div className="alert alert-success border-success">
                  <h6 className="alert-heading">
                    <i className="bi bi-cash-coin me-2"></i>
                    Cash on Delivery
                  </h6>
                  <p className="mb-2">Pay when you receive your order. Our delivery team will contact you before arrival.</p>
                  <ul className="mb-0 ps-3">
                    <li>✅ No online payment required</li>
                    <li>✅ Pay in cash to the delivery person</li>
                    <li>✅ Free delivery on all orders</li>
                    <li>✅ Inspect products before payment</li>
                  </ul>
                </div>

                
                <div className="d-grid gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading || cartItems.length === 0}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Place Order - Cash on Delivery
                      </>
                    )}
                  </button>
                </div>

                <p className="text-center text-muted small mt-3 mb-0">
                  By placing your order, you agree to our{' '}
                  <a href="#" className="text-decoration-none">Terms & Conditions</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestCheckoutPage;