import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';

const StarRating = ({ rating, totalReviews, size = 'medium' }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className={`star filled ${size}`} />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className={`star filled ${size}`} />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className={`star ${size}`} />);
    }

    return stars;
  };

  return (
    <div className="star-rating">
      <div className="stars">{renderStars()}</div>
      {totalReviews !== undefined && (
        <span className="rating-text">
          {Number(rating).toFixed(1)} ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
