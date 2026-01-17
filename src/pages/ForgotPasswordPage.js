import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.trim()
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
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
                  <i className="bi bi-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="fw-bold mb-2">Forgot Password?</h2>
                <p className="text-muted">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
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

            
              {message && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  {message}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setMessage('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}

            
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email Address
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-nut-brown btn-lg"
                    style={{ color: "white" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Reset Link
                      </>
                    )}
                  </button>
                </div>
              </form>

            
              <hr className="my-4" />
              
              <div className="text-center">
                <p className="mb-2">
                  <i className="bi bi-arrow-left me-2"></i>
                  Remember your password? <Link to="/login" className="text-decoration-none fw-semibold">Back to Login</Link>
                </p>
                <p className="mb-0 text-muted">
                  Don't have an account? <Link to="/register" className="text-decoration-none fw-semibold">Sign up</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;