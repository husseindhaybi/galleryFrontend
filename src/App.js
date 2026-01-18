import 'bootstrap-icons/font/bootstrap-icons.css';
import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { authService } from './services/api';

// Pages
import FloatingButtons from './components/FloatingButtons';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductsPage from './pages/ProductsPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';



// Admin Pages
import AddProduct from './pages/admin/AddProduct';
import AdminDashboard from './pages/admin/AdminDashboard';
import CategoriesManagement from './pages/admin/CategoriesManagement';
import EditProduct from './pages/admin/EditProduct';
import OrdersManagement from './pages/admin/OrdersManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import ReportsPage from './pages/admin/ReportsPage';
import ReviewsManagement from './pages/admin/ReviewsManagement';
import SettingsPage from './pages/admin/SettingsPage';
import UsersManagement from './pages/admin/UsersManagement';

// Components
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';


import './styles/App.css';


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};


function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="App">
      <ScrollToTop />

      {!isAdminRoute && <Navbar />}
      

      <main className="main-content" style={{ paddingTop: isAdminRoute ? '0' : '70px', minHeight: '100vh' }}>
        <Routes>
  
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
         

          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
       
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          
      
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
     
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products" 
            element={
              <ProtectedRoute>
                <ProductsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products/add" 
            element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/products/edit/:id" 
            element={
              <ProtectedRoute>
                <EditProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute>
                <OrdersManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <UsersManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/categories" 
            element={
              <ProtectedRoute>
                <CategoriesManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reviews" 
            element={
              <ProtectedRoute>
                <ReviewsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
          
        
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </main>
      
    
      {!isAdminRoute && <Footer />}
      
   
      {!isAdminRoute && <FloatingButtons />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;