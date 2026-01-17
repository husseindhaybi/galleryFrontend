import { useEffect, useRef, useState } from 'react';
import { FaBox, FaHome, FaShoppingCart, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService, cartService } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navbarRef = useRef(null);

  useEffect(() => {
    checkAuth();
    loadCartCount();
    
    window.addEventListener('storage', loadCartCount);
    window.addEventListener('cartUpdated', loadCartCount);
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', loadCartCount);
      window.removeEventListener('cartUpdated', loadCartCount);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);


  useEffect(() => {
    checkAuth();
    loadCartCount();
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavbarVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const checkAuth = () => {
    setIsAuthenticated(authService.isAuthenticated());
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  };

  const loadCartCount = async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await cartService.getCart();
        setCartCount(response.count || 0);
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      }
    } catch (error) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setCartCount(0);
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav 
      ref={navbarRef}
      className={`navbar navbar-expand-lg navbar-dark shadow fixed-top ${
        isNavbarVisible ? '' : 'navbar-hidden'
      }`}
      style={{
        background: 'linear-gradient(135deg, #D2B48C 0%, #C4A484 100%)',

        transition: 'transform 0.3s ease',
        transform: isNavbarVisible ? 'translateY(0)' : 'translateY(-100%)',
        zIndex: 1050
      }}
    >
      <div className="container-fluid px-3 px-md-4">
      
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          
          <div className="d-none d-sm-flex flex-column lh-sm">
            <span className="fw-bold">Gallery Dhaybi</span>
            
          </div>
        </Link>

        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

     
        <div className="collapse navbar-collapse" id="navbarContent">
      
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link 
                to="/" 
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                  isActiveLink('/') ? 'bg-white bg-opacity-25' : ''
                }`}
              >
                <FaHome size={16} />
                <span>Home</span>
              </Link>
            </li>
            
            <li className="nav-item">
              <Link 
                to="/products" 
                className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                  isActiveLink('/products') ? 'bg-white bg-opacity-25' : ''
                }`}
              >
                <FaBox size={16} />
                <span>Products</span>
              </Link>
            </li>
            
            {isAuthenticated && (user?.is_admin === 1 || user?.is_admin === true) && (
              <li className="nav-item">
                <Link 
                  to="/admin/dashboard" 
                  className={`nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-pill ${
                    isActiveLink('/admin/dashboard') ? 'bg-white bg-opacity-25' : ''
                  }`}
                >
                  <FaBox size={16} />
                  <span>Dashboard</span>
                </Link>
              </li>
            )}
            
          
          </ul>

          
          <div className="d-flex align-items-center gap-2">
           
            <Link to="/cart" className="position-relative text-decoration-none">
              <div 
                className="d-flex align-items-center justify-content-center rounded-circle cart-icon-wrapper"
                style={{ 
                  width: '42px', 
                  height: '42px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaShoppingCart size={18} color="white" />
                {cartCount > 0 && (
                  <span 
                    className="position-absolute badge rounded-pill bg-danger"
                    style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.25em 0.5em',
                      top: '-5px',
                      right: '-5px'
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </div>
            </Link>

       
            {isAuthenticated ? (
              <div className="dropdown">
                <button 
                  className="btn d-flex align-items-center gap-2 px-3 py-2 rounded-pill dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  <FaUser size={14} />
                  <span className="d-none d-lg-inline small">{user?.username || 'User'}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2">
                  <li>
                    <Link to="/profile" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <FaUser size={14} />
                      <span>My Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/orders" className="dropdown-item d-flex align-items-center gap-2 py-2">
                      <FaBox size={14} />
                      <span>My Orders</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                      style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link 
                  to="/login" 
                  className="btn btn-sm rounded-pill px-3 py-2"
                  style={{ 
                    fontSize: '0.875rem',
                    backgroundColor: 'transparent',
                    border: '2px solid rgba(255, 255, 255, 0.5)',
                    color: 'white'
                  }}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-sm rounded-pill px-3 py-2"
                  style={{ 
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    border: 'none',
                    color: '#667eea',
                    fontWeight: '500'
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .cart-icon-wrapper:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
        }
        .navbar-hidden {
          transform: translateY(-100%) !important;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.15) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;