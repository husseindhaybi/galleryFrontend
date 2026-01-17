import { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 992);

  useEffect(() => {
    const handleResize = () => {
      const newIsLargeScreen = window.innerWidth >= 992;
      setIsLargeScreen(newIsLargeScreen);
      
     
      if (newIsLargeScreen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
    
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      
      <div 
        className="flex-grow-1 d-flex flex-column"
        style={{
          marginLeft: isLargeScreen ? '280px' : '0',
          transition: 'margin-left 0.3s ease-in-out',
          width: isLargeScreen ? 'calc(100% - 280px)' : '100%'
        }}
      >
       
        <nav 
          className="navbar navbar-light bg-white border-bottom px-3 py-3 d-lg-none position-sticky top-0 shadow-sm"
          style={{ zIndex: 1030 }}
        >
          <button 
            className="btn btn-outline-dark d-flex align-items-center gap-2"
            onClick={toggleSidebar}
          >
            <FaBars />
            <span>Menu</span>
          </button>
          <span className="navbar-brand mb-0 h5 fw-bold">Admin Panel</span>
        </nav>

  
        <main className="flex-grow-1 p-3 p-lg-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;