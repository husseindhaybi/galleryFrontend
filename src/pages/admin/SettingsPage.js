import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaKey, FaLock, FaSave, FaUser } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';


const SettingsPage = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    created_at: ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch {
      showMessage('danger', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/profile',
        {
          full_name: user.full_name,
          email: user.email,
          phone: user.phone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'Profile updated successfully');
    } catch {
      showMessage('danger', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    if (passwords.new_password !== passwords.confirm_password) {
      showMessage('danger', 'Passwords do not match');
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/change-password',
        {
          current_password: passwords.current_password,
          new_password: passwords.new_password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showMessage('success', 'Password changed successfully');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch {
      showMessage('danger', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-4">
        <div className="mb-4">
          <h2>Admin Settings</h2>
          <p className="text-muted">Manage your account and security</p>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="row g-4">
         
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-light fw-bold">
                <FaUser className="me-2" /> Profile Information
              </div>
              <div className="card-body">
                <form onSubmit={updateProfile}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input className="form-control" value={user.username} disabled />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-control"
                      value={user.full_name}
                      onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user.email}
                      onChange={(e) => setUser({ ...user, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      className="form-control"
                      value={user.phone || ''}
                      onChange={(e) => setUser({ ...user, phone: e.target.value })}
                    />
                  </div>

                  <button className="btn btn-primary" disabled={saving}>
                    <FaSave className="me-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>

    
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-light fw-bold">
                <FaKey className="me-2" /> Change Password
              </div>
              <div className="card-body">
                <form onSubmit={changePassword}>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.current_password}
                      onChange={(e) =>
                        setPasswords({ ...passwords, current_password: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.new_password}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new_password: e.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={passwords.confirm_password}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm_password: e.target.value })
                      }
                    />
                  </div>

                  <button className="btn btn-warning" disabled={saving}>
                    <FaLock className="me-2" />
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

     
        <div className="card mt-4 shadow-sm">
          <div className="card-body d-flex justify-content-between">
            <div>
              <strong>Account Type:</strong> Administrator
            </div>
            <div>
              <strong>Member Since:</strong>{' '}
              {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
