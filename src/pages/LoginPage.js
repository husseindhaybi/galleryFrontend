import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const response = await axios.post(
        '/api/users/login',
        {
          username: formData.username,
          password: formData.password
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      if (response?.data?.success) {
   
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

      
        if (response.data.first_login) {
          Swal.fire({
  icon: 'success',
  title: 'Welcome to FurnitureSmart! ',
  text: 'Check your email for a welcome message.',
  confirmButtonText: 'Let\'s Go!'
});

        }

        try {
          const adminCheck = await axios.get(
            '/api/admin/check',
            {
              headers: { Authorization: `Bearer ${response.data.token}` },
              timeout: 10000
            }
          );

          if (adminCheck?.data?.is_admin) {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        } catch {
          navigate('/');
        }

      
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      setError(
        error?.response?.data?.error ||
        error?.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">

             
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-person-circle text-primary" style={{ fontSize: '3.5rem' }}></i>
                </div>
                <h2 className="fw-bold mb-2">Welcome Back!</h2>
                <p className="text-muted">Login to FurnitureSmart</p>
              </div>

           
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              
              <form onSubmit={handleSubmit}>
                
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">
                    Username or Email
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username or email"
                      required
                      disabled={loading}
                      autoComplete="username"
                    />
                  </div>
                </div>

               
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

            
                <div className="text-end mb-3">
                  <Link to="/forgot-password" className="text-decoration-none small fw-semibold">
                    Forgot Password?
                  </Link>
                </div>

              
                <div className="d-grid mb-3">
                  <button
                    type="submit"
                    className="btn btn-nut-brown btn-lg"
                    disabled={loading}
                    style={{ color: '#fff' }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-decoration-none fw-semibold">
                    Sign up here
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
