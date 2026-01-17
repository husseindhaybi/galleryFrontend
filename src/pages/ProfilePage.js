import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        '/api/users/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setFormData({
        full_name: response.data.user.full_name || '',
        email: response.data.user.email || '',
        phone: response.data.user.phone || '',
        address: response.data.user.address || ''
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/users/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire({
  icon: 'success',
  title: 'Profile Updated!',
  text: 'Profile updated successfully!',
  confirmButtonText: 'OK'
});

      setEditing(false);
      loadProfile();
    } catch {
      Swal.fire({
  icon: 'error',
  title: 'Update Failed',
  text: 'Failed to update profile',
  confirmButtonText: 'OK'
});

    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-secondary" />
        <p className="mt-3 text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="bg-nut-brown text-white py-4 mb-4">
        <div className="container">
          <h1 className="display-5 fw-bold mb-0">
           
            My Profile
          </h1>
        </div>
      </div>

      <div className="container mb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">

            {!editing ? (
              <>
               
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-body p-4">

                    
                    <div className="text-center mb-4">
                     
                      <h3 className="mb-1">{user?.full_name || user?.username}</h3>
                      <p className="text-muted">
                        Member since {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <hr />

             
                    <div className="row g-3">
                      {[
                        ['Username', user.username],
                        ['Full Name', user.full_name],
                        ['Email', user.email],
                        ['Phone', user.phone],
                        ['Address', user.address]
                      ].map(([label, value], i) => (
                        <div className="col-md-6" key={i}>
                          <div className="p-3 bg-light rounded">
                            <small className="text-muted">{label}</small>
                            <div className="fw-semibold">
                              {value || <span className="text-muted">Not set</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="d-grid mt-4">
                      <button
                        onClick={() => setEditing(true)}
                        className="btn btn-nut-brown btn-lg"
                        style={{ color: '#fff' }}
                      >
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>

              
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <div className="row g-2">
                      <div className="col-md-6">
                        <button
                          onClick={() => navigate('/orders')}
                          className="btn btn-outline-nut-brown w-100"
                          style={{ color: '#fff' }}
                        >
                          View My Orders
                        </button>
                      </div>
                      <div className="col-md-6">
                        <button
                          onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                          }}
                          className="btn btn-outline-danger w-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              
              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit}>
                    {['full_name', 'email', 'phone', 'address'].map((field, i) => (
                      <div className="mb-3" key={i}>
                        <label className="form-label text-nut-brown fw-semibold">
                          {field.replace('_', ' ').toUpperCase()}
                        </label>
                        {field === 'address' ? (
                          <textarea
                            name={field}
                            className="form-control"
                            rows="3"
                            value={formData[field]}
                            onChange={handleChange}
                          />
                        ) : (
                          <input
                            type="text"
                            name={field}
                            className="form-control"
                            value={formData[field]}
                            onChange={handleChange}
                          />
                        )}
                      </div>
                    ))}

                    <div className="d-flex gap-2">
                      <button className="btn btn-nut-brown flex-fill">
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="btn btn-outline-secondary flex-fill"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
