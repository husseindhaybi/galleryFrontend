import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { reviewService } from '../services/api';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      Swal.fire({
  icon: 'warning',
  title: 'Rating Required',
  text: 'Please select a rating',
  confirmButtonText: 'OK'
});

      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.addReview(productId, {
        rating,
        review_text: reviewText
      });
      
      Swal.fire({
  icon: 'success',
  title: 'Review Added!',
  text: 'Review added successfully!',
  confirmButtonText: 'OK'
});

      setRating(0);
      setReviewText('');
      
      if (onReviewAdded) {
        onReviewAdded();
      }
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Review Failed',
  text: error.response?.data?.error || 'Failed to add review',
  confirmButtonText: 'OK'
});

    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-form">
      <h3>Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="rating-input">
          <label>Your Rating:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={star <= (hoverRating || rating) ? 'star filled' : 'star'}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Your Review (Optional):</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-nut-brown"

          disabled={isSubmitting}
          style={{ color: '#fff' }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
