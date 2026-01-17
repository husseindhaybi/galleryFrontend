import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {

    const urlToken = searchParams.get('token');
    
    if (!urlToken) {
      setError('Invalid reset link. Please request a new password reset.');
      setVerifying(false);
      return;
    }

    setToken(urlToken);


    verifyToken(urlToken);
  }, [searchParams]);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.post('/api/auth/verify-reset-token', {
        token: tokenToVerify
      });

      if (response.data.valid) {
        setTokenValid(true);
      } else {
        setError(response.data.message || 'This reset link is invalid or has expired.');
        setTokenValid(false);
      }
    } catch (err) {
      setError('Failed to verify reset link. Please try again.');
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

  
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        token: token,
        new_password: password
      });

      if (response.data.success) {
       
        const confirmed = window.confirm('✅ ' + response.data.message + '\n\nClick OK to go to login page.');
        if (confirmed) {
          navigate('/login');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (verifying) {
    return (
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5 text-center">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="text-muted">Verifying reset link...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (!tokenValid) {
    return (
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow-lg border-0 border-danger border-2">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '4rem' }}></i>
                </div>
                <h2 className="fw-bold text-danger mb-3">Invalid Reset Link</h2>
                <p className="text-muted lead mb-4">{error}</p>
                
                <div className="d-grid gap-2">
                  <Link to="/forgot-password" className="btn btn-primary btn-lg">
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Request New Reset Link
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container">
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
     
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-key-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h2 className="fw-bold mb-2">Reset Your Password</h2>
                <p className="text-muted">Enter your new password below.</p>
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
                  <label htmlFor="password" className="form-label fw-semibold">
                    New Password
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Password must be at least 6 characters long
                  </div>
                </div>


                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirm New Password
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock-fill"></i>
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="form-control"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`bi bi-eye${showConfirmPassword ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

               
                <div className="d-grid mb-3">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Reset Password
                      </>
                    )}
                  </button>
                </div>
              </form>

   
              <hr className="my-4" />
              
              <div className="text-center">
                <p className="mb-0">
                  <i className="bi bi-arrow-left me-2"></i>
                  Remember your password? <Link to="/login" className="text-decoration-none fw-semibold">Back to Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;