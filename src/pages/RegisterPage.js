import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  
  const isStrongPassword = (password) => {
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isStrongPassword(formData.password)) {
      newErrors.password =
        'Password must be at least 8 chars, include uppercase, lowercase, number & special symbol';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/users/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          html: `
            Check your email for a welcome message<br/>
            with important information about your account.
          `,
          confirmButtonText: 'OK'
        });

        navigate('/');
        window.location.reload();
      }
    } catch (error) {
      setErrors({
        general: error.response?.data?.error || 'Registration failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100 py-5">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="fw-bold mb-2">Create Account</h2>
                <p className="text-muted">Join FurnitureSmart today</p>
              </div>

              {errors.general && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {errors.general}
                  <button type="button" className="btn-close"
                    onClick={() => setErrors({ ...errors, general: '' })}
                    aria-label="Close"
                  ></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                
             
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">
                    Username <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                      disabled={loading}
                    />
                    {errors.username && (
                      <div className="invalid-feedback">{errors.username}</div>
                    )}
                  </div>
                </div>

             
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>
                </div>

           
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-lock"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        disabled={loading}
                      />
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                      Confirm Password <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light">
                        <i className="bi bi-lock-fill"></i>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        disabled={loading}
                      />
                      <button className="btn btn-outline-secondary" type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                      </button>
                      {errors.confirmPassword && (
                        <div className="invalid-feedback">{errors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                </div>

                
                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person-badge"></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      disabled={loading}
                    />
                    {errors.full_name && (
                      <div className="invalid-feedback">{errors.full_name}</div>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone (Optional)</label>
                  <input type="tel" className="form-control" name="phone"
                    onChange={handleChange} value={formData.phone} />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Address (Optional)</label>
                  <textarea className="form-control" name="address"
                    rows="2" onChange={handleChange} value={formData.address} />
                </div>

                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-nut-brown btn-lg" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </div>
              </form>

              <hr className="my-4" />

              <div className="text-center mb-3">
                Already have an account?{" "}
                <Link to="/login" className="fw-semibold">Login here</Link>
              </div>

              <div className="text-center">
                <p className="text-muted mb-2">Or continue as guest</p>
                <button onClick={() => navigate('/products')}
                  className="btn btn-outline-secondary" disabled={loading}>
                  Browse as Guest
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
