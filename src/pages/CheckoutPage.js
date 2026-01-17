import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, orderService } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const isAuthenticated = authService.isAuthenticated();
  

  const [formData, setFormData] = useState({

    username: '',
    password: '',
    

    guest_name: '',
    guest_email: '',
    guest_phone: '',
    
 
    shipping_address: '',
    

    cart_items: []
  });
  

  const [cartSummary, setCartSummary] = useState({
    items: [],
    total: 0,
    count: 0
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
   
      const checkoutData = localStorage.getItem('checkoutData');
      
      if (checkoutData) {
        const { items, total, count } = JSON.parse(checkoutData);
        setCartSummary({
          items: items,
          total: Number(total) || 0,
          count: count || 0
        });
        
   
        setFormData(prev => ({
          ...prev,
          cart_items: items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        }));
      } else {
    
        const savedCart = localStorage.getItem('guestCart');
        if (savedCart) {
          const cart = JSON.parse(savedCart);
          setCartSummary({
            items: cart,
            total: cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
            count: cart.reduce((sum, item) => sum + item.quantity, 0)
          });
          
          setFormData(prev => ({
            ...prev,
            cart_items: cart.map(item => ({
              product_id: item.product_id,
              quantity: item.quantity
            }))
          }));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart data');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
     
      if (cartSummary.items.length === 0) {
        setError('Your cart is empty');
        setLoading(false);
        return;
      }

 
      if (!isAuthenticated) {
        if (!formData.username || !formData.password || !formData.guest_name || !formData.guest_email || !formData.guest_phone) {
          setError('Please fill in all required fields');
          setLoading(false);
          return;
        }
        
  
        if (formData.username.length < 3) {
          setError('Username must be at least 3 characters');
          setLoading(false);
          return;
        }
        
     
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
      }

      if (!formData.shipping_address) {
        setError('Please enter your shipping address');
        setLoading(false);
        return;
      }

      let response;

      if (isAuthenticated) {
        
        const orderData = {
          shipping_address: formData.shipping_address,
          cart_items: formData.cart_items,
          total_amount: cartSummary.total
        };
        response = await orderService.createOrder(orderData);
      } else {
       
        response = await axios.post('/api/orders/guest-checkout', {
          username: formData.username,
          password: formData.password,
          full_name: formData.guest_name,
          email: formData.guest_email,
          phone: formData.guest_phone,
          shipping_address: formData.shipping_address,
          cart_items: formData.cart_items
        });
      }
      
 
      localStorage.removeItem('guestCart');
      localStorage.removeItem('checkoutData');

      setSuccess(true);
      
 
      setTimeout(() => {
        if (isAuthenticated) {
          navigate('/orders');
        } else {
          navigate('/login');
        }
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="checkout-page">
        <div className="success-message-box">
          <div className="success-icon">✅</div>
          <h2>Order Placed Successfully!</h2>
          <p>Your order has been received and will be delivered soon.</p>
          <p className="payment-info">
            <strong>Payment Method:</strong> Cash on Delivery
          </p>
          <p>You will pay when the order arrives at your address.</p>
          {!isAuthenticated && (
            <>
              <p className="guest-info">
                A confirmation email has been sent to {formData.guest_email}
              </p>
              <p className="account-created">
                ✅ <strong>Account Created!</strong><br/>
                Username: <strong>{formData.username}</strong><br/>
                You can now login to track your orders!
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (cartSummary.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-cart-message">
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart before checking out.</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">

        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-items">
            {cartSummary.items.map((item, index) => (
              <div key={index} className="summary-item">
                <div className="item-info">
                  <h4>{item.product_name}</h4>
                  <p>Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${Number(cartSummary.total).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="total-row total-final">
              <strong>Total:</strong>
              <strong>${Number(cartSummary.total).toFixed(2)}</strong>
            </div>
          </div>

          <div className="payment-method-box">
            <h3>Payment Method</h3>
            <div className="payment-option selected">
              <span>Cash on Delivery</span>
            </div>
            <p className="payment-note">
              You will pay in cash when your order is delivered to your address.
            </p>
          </div>
        </div>

       
        <div className="checkout-form">
          <h2>Delivery Information</h2>
          
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
         
            {!isAuthenticated && (
              <>
                <div className="form-section">
                  <h3>Create Your Account</h3>
                  <p className="section-description">Create an account to easily track your orders</p>
                  
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Choose a username (min. 3 characters)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Choose a password (min. 6 characters)"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Your Information</h3>
                  
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleChange}
                      required
                      placeholder="+961 71874503"
                    />
                  </div>
                </div>
              </>
            )}

         
            <div className="form-section">
              <h3>Shipping Address</h3>
              
              <div className="form-group">
                <label>Complete Address *</label>
                <textarea
                  name="shipping_address"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  required
                  rows="4"
                  placeholder="Enter your complete delivery address including street, city, and postal code"
                />
              </div>
            </div>

    
            <button 
              type="submit" 
              className="btn btn-nut-brown btn-block btn-large"
              disabled={loading}
              style={{ color: '#fff' }}
            >
              {loading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
            </button>

            <p className="checkout-note">
              By placing your order, you agree to pay in cash when the order is delivered.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;