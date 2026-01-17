import { useEffect, useState } from 'react';
import { FaMinus, FaPlus, FaShoppingBag, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { authService, productService } from '../services/api';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
     
      const savedCart = localStorage.getItem('guestCart');
      if (!savedCart || savedCart === '[]') {
        setCartItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const cart = JSON.parse(savedCart);
      
     
      const cartWithDetails = await Promise.all(
        cart.map(async (item) => {
          try {
            const response = await productService.getById(item.product_id);
            const product = response.product;
            
            return {
              ...item,
              product_name: product.product_name,
              description: product.description,
              price: product.price,
              image_url: product.image_url || (product.images && product.images[0]?.image_url),
              stock_quantity: product.stock_quantity
            };
          } catch (error) {
            console.error(`Error loading product ${item.product_id}:`, error);
            return null;
          }
        })
      );

    
      const validItems = cartWithDetails.filter(item => item !== null);
      
      setCartItems(validItems);
      calculateTotal(validItems);
      
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
    setTotal(sum);
  };

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;
    

    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const updatedCart = cart.map(cartItem => 
      cartItem.product_id === item.product_id 
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    
   
    const updatedItems = cartItems.map(cartItem => 
      cartItem.product_id === item.product_id 
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const removeItem = async (item) => {
    if (!window.confirm('Remove this item from cart?')) return;
    
    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const updatedCart = cart.filter(
      cartItem => cartItem.product_id !== item.product_id
    );
    localStorage.setItem('guestCart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
    

    const updatedItems = cartItems.filter(
      cartItem => cartItem.product_id !== item.product_id
    );
    setCartItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return;

    localStorage.setItem('guestCart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
    
    setCartItems([]);
    setTotal(0);
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
  icon: 'warning',
  title: 'Empty Cart',
  text: 'Your cart is empty!',
  confirmButtonText: 'OK'
});

      return;
    }

    const checkoutData = {
      items: cartItems,
      total: total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };

    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <FaShoppingBag className="text-muted mb-4" style={{ fontSize: '5rem' }} />
          <h2 className="mb-3">Your cart is empty</h2>
          <p className="text-muted mb-4">Start shopping to add items to your cart</p>
          <button 
            className="btn btn-nut-brown btn-lg px-5"
            style={{ color: '#fff' }}

            onClick={() => navigate('/products')}
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 fw-bold mb-0">Shopping Cart</h1>
        <button 
          className="btn btn-outline-danger"
          onClick={clearCart}
        >
          <FaTrash className="me-2" />
          Clear Cart
        </button>
      </div>

      <div className="row g-4">
      
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {cartItems.map((item, index) => (
                <div 
                  key={item.product_id} 
                  className={`p-3 ${index !== cartItems.length - 1 ? 'border-bottom' : ''}`}
                >
                  <div className="row g-3 align-items-center">
             
                    <div className="col-auto">
                      <div 
                        className="bg-light rounded overflow-hidden"
                        style={{ width: '100px', height: '100px' }}
                      >
                        <img 
                          src={item.image_url ? `${item.image_url}` : '/placeholder.jpg'} 
                          alt={item.product_name}
                          className="img-fluid w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    </div>

                
                    <div className="col">
                      <h5 className="mb-1 fw-bold">{item.product_name}</h5>
                      <p className="text-muted mb-2 small" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {item.description}
                      </p>
                      <p className="mb-0">
                        <span className="fw-bold" style={{ color: '#8B5A2B' }}>
                          ${Number(item.price).toFixed(2)}
                        </span>
                        <span className="text-muted small"> each</span>
                      </p>
                    </div>

                   
                    <div className="col-auto">
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{ width: '36px' }}
                        >
                          <FaMinus size={12} />
                        </button>
                        <div 
                          className="btn btn-outline-secondary btn-sm"
                          style={{ 
                            width: '50px',
                            backgroundColor: 'white',
                            cursor: 'default',
                            pointerEvents: 'none'
                          }}
                        >
                          {item.quantity}
                        </div>
                        <button 
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                          style={{ width: '36px' }}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    </div>

                  
                    <div className="col-auto text-end">
                      <p className="mb-2 fw-bold h5" style={{ color: '#8B5A2B' }}>
                        ${(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeItem(item)}
                        title="Remove from cart"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-body p-4">
              <h3 className="h4 fw-bold mb-4">Order Summary</h3>
              
             
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold">${Number(total).toFixed(2)}</span>
              </div>

         
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping:</span>
                <span className="text-success fw-semibold">Free</span>
              </div>

              <hr />

           
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold mb-0">Total:</span>
                <span className="h5 fw-bold mb-0" style={{ color: '#8B5A2B' }}>
                  ${Number(total).toFixed(2)}
                </span>
              </div>

    
              <button 
                className="btn btn-nut-brown btn-lg w-100 mb-3"

                onClick={proceedToCheckout}
                style={{
                  color: '#fff',  
                  padding: '0.75rem',
                  fontSize: '1.1rem',
                  fontWeight: '600'
                }}
              >
                Proceed to Checkout
              </button>

          
              <div className="alert alert-info mb-0" style={{ backgroundColor: '#e7f3ff', border: 'none' }}>
                <p className="mb-1 small">
                  <strong>💳 Payment Method:</strong>
                </p>
                <p className="mb-0 small text-muted">
                  Cash on Delivery - Pay when your order arrives
                </p>
              </div>

           
              {!isAuthenticated && (
                <div className="alert alert-warning mt-3 mb-0" style={{ backgroundColor: '#fff3cd', border: 'none' }}>
                  <p className="mb-0 small">
                    <strong>💡 Shopping as guest</strong><br/>
                    Your cart is saved in your browser
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;