import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaRegStar, FaSearch, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import AdminLayout from '../../components/AdminLayout';

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [searchTerm, ratingFilter, reviews]);

  const loadReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Reviews loaded:', response.data);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let filtered = reviews;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => {
        const productMatch = r.product_name && r.product_name.toLowerCase().includes(searchLower);
        const userMatch = r.username && r.username.toLowerCase().includes(searchLower);
        const commentMatch = r.comment && r.comment.toLowerCase().includes(searchLower);
        const reviewTextMatch = r.review_text && r.review_text.toLowerCase().includes(searchLower);
        
        return productMatch || userMatch || commentMatch || reviewTextMatch;
      });
    }

    if (ratingFilter) {
      filtered = filtered.filter(r => r.rating == ratingFilter);
    }

    setFilteredReviews(filtered);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-muted" />);
      }
    }

    return <div className="d-flex gap-1">{stars}</div>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
    
        <div className="mb-4">
          <h1 className="h3 mb-1">Reviews Management</h1>
          <p className="text-muted mb-0">View and moderate customer reviews</p>
        </div>

        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
             
              <div className="col-md-6">
                <label className="form-label small fw-semibold">Search Reviews</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by product, user or comment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

       
              <div className="col-md-3">
                <label className="form-label small fw-semibold">Filter by Rating</label>
                <select
                  className="form-select"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value)}
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

            
              <div className="col-md-3 text-end">
                <small className="text-muted">
                  <strong>{filteredReviews.length}</strong> review{filteredReviews.length !== 1 ? 's' : ''} found
                </small>
              </div>
            </div>
          </div>
        </div>

      
        {filteredReviews.length === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <FaStar size={48} className="text-muted mb-3" />
              <h4 className="text-muted">No reviews found</h4>
              <p className="text-muted mb-0">
                {searchTerm || ratingFilter 
                  ? 'Try adjusting your search or filters' 
                  : 'Customer reviews will appear here'}
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredReviews.map(review => (
              <div key={review.review_id} className="col-12">
                <div className="card shadow-sm">
                  <div className="card-body">
                
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                      
                        <h6 className="fw-bold mb-2">
                          {review.product_name || 'Unknown Product'}
                        </h6>
                        
                  
                        <div className="d-flex flex-wrap align-items-center gap-3 small text-muted">
                          <span>
                            <strong>By:</strong> {review.username || review.full_name || 'Anonymous'}
                          </span>
                          <span>
                            <strong>Date:</strong>{' '}
                            {review.review_date 
                              ? new Date(review.review_date).toLocaleDateString()
                              : review.created_at 
                              ? new Date(review.created_at).toLocaleDateString()
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>

             
                      <div className="ms-3">
                        {renderStars(review.rating)}
                      </div>
                    </div>

                
                    {(review.comment || review.review_text) && (
                      <div className="border-top pt-3">
                        <p className="text-muted mb-0">
                          {review.comment || review.review_text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReviewsManagement;