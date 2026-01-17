import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaCalendar, FaCheck, FaClock, FaSearch, FaTimes, FaTrash, FaUserShield, FaUsers } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';
const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); 

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, activeFilter, users]);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

 
  const applyFilters = () => {
    let filtered = [...users];


    if (activeFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(user => {
        const userDate = new Date(user.created_at);
        
        if (activeFilter === 'today') {
          return userDate >= today;
        } else if (activeFilter === 'week') {
          return userDate >= weekAgo;
        } else if (activeFilter === 'month') {
          return userDate >= monthAgo;
        }
        return true;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.full_name && u.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredUsers(filtered);
  };


  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      total: users.length,
      today: users.filter(u => new Date(u.created_at) >= today).length,
      week: users.filter(u => new Date(u.created_at) >= weekAgo).length,
      month: users.filter(u => new Date(u.created_at) >= monthAgo).length,
      admins: users.filter(u => u.is_admin).length
    };
  };

  const stats = getStats();

  const toggleAdmin = async (userId, currentStatus) => {
    const action = currentStatus ? 'remove admin rights from' : 'make admin';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/users/${userId}/admin`,
        { is_admin: !currentStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire({
  icon: 'success',
  title: 'User Updated!',
  text: 'User updated successfully!',
  confirmButtonText: 'OK'
});

      loadUsers();
    } catch (error) {
      console.error('Toggle admin error:', error);
      Swal.fire({
  icon: 'error',
  title: 'Update Failed',
  text: error.response?.data?.error || 'Failed to update user',
  confirmButtonText: 'OK'
});

    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?\n\n⚠️ This action cannot be undone!`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Swal.fire({
  icon: 'success',
  title: 'User Deleted!',
  text: 'User deleted successfully!',
  confirmButtonText: 'OK'
});

      loadUsers();
    } catch (error) {
      console.error('Delete user error:', error);
      Swal.fire({
  icon: 'error',
  title: 'Delete Failed',
  text: error.response?.data?.error || 'Failed to delete user',
  confirmButtonText: 'OK'
});

    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading users...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
   
      <div className="mb-4">
        <h1 className="h3 fw-bold mb-1"> Users Management</h1>
        <p className="text-muted mb-0">Manage registered users and permissions</p>
      </div>

     
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${activeFilter === 'all' ? 'border-primary border-3' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveFilter('all')}
          >
            <div className="card-body text-center p-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <FaUsers className="text-primary fs-4" />
              </div>
              <h3 className="h4 fw-bold text-primary mb-1">{stats.total}</h3>
              <p className="text-muted mb-0 small">All Users</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${activeFilter === 'today' ? 'border-success border-3' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveFilter('today')}
          >
            <div className="card-body text-center p-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <FaClock className="text-success fs-4" />
              </div>
              <h3 className="h4 fw-bold text-success mb-1">{stats.today}</h3>
              <p className="text-muted mb-0 small">Today</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${activeFilter === 'week' ? 'border-info border-3' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveFilter('week')}
          >
            <div className="card-body text-center p-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <FaCalendar className="text-info fs-4" />
              </div>
              <h3 className="h4 fw-bold text-info mb-1">{stats.week}</h3>
              <p className="text-muted mb-0 small">This Week</p>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div 
            className={`card border-0 shadow-sm h-100 ${activeFilter === 'month' ? 'border-warning border-3' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveFilter('month')}
          >
            <div className="card-body text-center p-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
                <FaCalendar className="text-warning fs-4" />
              </div>
              <h3 className="h4 fw-bold text-warning mb-1">{stats.month}</h3>
              <p className="text-muted mb-0 small">This Month</p>
            </div>
          </div>
        </div>
      </div>

     
      {activeFilter !== 'all' && (
        <div className="alert alert-info d-flex align-items-center justify-content-between mb-4">
          <span>
            <strong>Active Filter:</strong> Showing users registered{' '}
            {activeFilter === 'today' && 'today'}
            {activeFilter === 'week' && 'in the last 7 days'}
            {activeFilter === 'month' && 'in the last 30 days'}
          </span>
          <button 
            className="btn btn-sm btn-outline-info"
            onClick={() => setActiveFilter('all')}
          >
            Clear Filter
          </button>
        </div>
      )}


      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-3">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-8 col-lg-9">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <FaSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search users by name, username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="col-12 col-md-4 col-lg-3 text-md-end">
              <span className="badge bg-primary fs-6 px-3 py-2">
                {filteredUsers.length} users
              </span>
            </div>
          </div>
        </div>
      </div>

 
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-5">
              <h3 className="h5 text-muted mb-2">No users found</h3>
              <p className="text-muted small mb-0">
                {searchTerm || activeFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms' 
                  : 'No registered users yet'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="px-4 py-3 fw-semibold text-nowrap">ID</th>
                    <th className="py-3 fw-semibold text-nowrap">Username</th>
                    <th className="py-3 fw-semibold text-nowrap">Email</th>
                    <th className="py-3 fw-semibold text-nowrap d-none d-lg-table-cell">Full Name</th>
                    <th className="py-3 fw-semibold text-nowrap d-none d-md-table-cell">Registered</th>
                    <th className="py-3 fw-semibold text-nowrap text-center">Admin</th>
                    <th className="py-3 fw-semibold text-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.user_id}>
                      <td className="px-4 py-3 fw-bold text-primary">
                        #{user.user_id}
                      </td>
                      <td className="py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div 
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                            style={{ width: '36px', height: '36px', fontSize: '14px' }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-truncate d-inline-block" style={{ maxWidth: '250px' }}>
                          {user.email}
                        </span>
                      </td>
                      <td className="py-3 d-none d-lg-table-cell">
                        <span className="text-muted">
                          {user.full_name || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 text-muted d-none d-md-table-cell">
                        <small>
                          {new Date(user.created_at).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="py-3 text-center">
                        {user.is_admin ? (
                          <span className="badge bg-success d-inline-flex align-items-center gap-1">
                            <FaCheck size={12} />
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="badge bg-secondary d-inline-flex align-items-center gap-1">
                            <FaTimes size={12} />
                            <span>User</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="d-flex gap-1 justify-content-center">
                          <button
                            className={`btn btn-sm ${
                              user.is_admin 
                                ? 'btn-outline-warning' 
                                : 'btn-outline-success'
                            }`}
                            onClick={() => toggleAdmin(user.user_id, user.is_admin)}
                            title={user.is_admin ? 'Remove Admin Rights' : 'Make Admin'}
                          >
                            <FaUserShield />
                          </button>
                          
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => deleteUser(user.user_id, user.username)}
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      
      
    </AdminLayout>
  );
};

export default UsersManagement;