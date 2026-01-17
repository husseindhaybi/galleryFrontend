import { useEffect, useState } from 'react';
import {
  FaBox,
  FaChartBar,
  FaChartLine,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaStar,
  FaTags,
  FaUsers
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

 
  const handleLinkClick = () => {
    if (!isLargeScreen && toggleSidebar) {
      toggleSidebar();
    }
  };

  const linkStyle = {
    transition: 'background-color 0.2s',
  };

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link 
      to={to} 
      className={`d-flex align-items-center gap-3 px-4 py-3 text-decoration-none text-white ${
        isActive(to) ? 'bg-primary' : ''
      }`}
      onClick={handleLinkClick}
      style={linkStyle}
      onMouseEnter={(e) => !isActive(to) && (e.currentTarget.style.backgroundColor = '#343a40')}
      onMouseLeave={(e) => !isActive(to) && (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <Icon className="fs-5" />
      <span>{children}</span>
    </Link>
  );

  return (
    <>
 
      {isOpen && !isLargeScreen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
          style={{ 
            zIndex: 1040,
            opacity: 0.5
          }}
          onClick={toggleSidebar}
        />
      )}

    
      <aside 
        className="bg-dark text-white position-fixed top-0 start-0 h-100 d-flex flex-column"
        style={{
          width: '280px',
          zIndex: 1050,
          transform: isLargeScreen ? 'translateX(0)' : (isOpen ? 'translateX(0)' : 'translateX(-100%)'),
          transition: 'transform 0.3s ease-in-out',
        }}
      >

        <div className="p-4 border-bottom border-secondary">
          <div className="d-flex align-items-center gap-3">
            <FaHome className="fs-3 text-primary" />
            <div>
              <h2 className="h5 mb-0 fw-bold">Admin Panel</h2>
              <p className="small text-muted mb-0">FurnitureSmart</p>
            </div>
          </div>
        </div>

       
        <nav className="flex-grow-1 overflow-auto py-3">
          <NavLink to="/admin/dashboard" icon={FaChartBar}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products" icon={FaBox}>
            Products
          </NavLink>

          <NavLink to="/admin/orders" icon={FaShoppingCart}>
            Orders
          </NavLink>

          <NavLink to="/admin/users" icon={FaUsers}>
            Users
          </NavLink>

          <NavLink to="/admin/categories" icon={FaTags}>
            Categories
          </NavLink>

          <NavLink to="/admin/reviews" icon={FaStar}>
            Reviews
          </NavLink>

          <NavLink to="/admin/reports" icon={FaChartLine}>
            Reports
          </NavLink>

          <NavLink to="/admin/settings" icon={FaCog}>
            Settings
          </NavLink>
        </nav>

      
        <div className="p-4 border-top border-secondary">
          <button 
            onClick={handleLogout} 
            className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;