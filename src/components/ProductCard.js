import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { cartService } from '../services/api';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);

  const handleClick = () => {
    navigate(`/products/${product.product_id}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (product.stock_quantity === 0) {
      Swal.fire({
  icon: 'warning',
  title: 'Out of Stock',
  text: 'This product is out of stock!',
  confirmButtonText: 'OK'
});

      return;
    }
    
    setIsAdding(true);
    try {
      await cartService.addToCart(product.product_id, 1);
      
     
      window.dispatchEvent(new Event('cartUpdated'));
      
  
      const toast = document.createElement('div');
      toast.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-success alert-dismissible fade show';
      toast.style.zIndex = '9999';
      toast.innerHTML = `
        <strong>Success!</strong> ${product.product_name} added to cart.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
  icon: 'error',
  title: 'Add to Cart Failed',
  text: 'Failed to add product to cart',
  confirmButtonText: 'OK'
});

    } finally {
      setIsAdding(false);
    }
  };

 
  const ratingValue = product.avg_rating || product.average_rating || 0;
  const rating = Number(ratingValue);
  const ratingDisplay = rating > 0 ? rating.toFixed(1) : '0.0';
  const reviewCount = product.review_count || 0;

  return (
    <div 
      className="card h-100 shadow-sm border-0 position-relative" 
      onClick={handleClick}
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
    >
     
      <div 
        className="position-relative bg-light overflow-hidden" 
        style={{ paddingTop: '100%' }}
      >
        <img 
          src={product.image_url ? `${product.image_url}` : '/placeholder.jpg'} 
          alt={product.product_name}
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ 
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          onError={(e) => {
            e.target.src = '/placeholder.jpg';
          }}
          onMouseEnter={(e) => e.target.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
        />
        
       
        {product.stock_quantity === 0 && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ 
              backgroundColor: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(2px)'
            }}
          >
            <span className="badge bg-danger fs-6 px-3 py-2 text-uppercase fw-bold">
              Out of Stock
            </span>
          </div>
        )}

       
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-warning text-dark px-2 py-1 small">
              Only {product.stock_quantity} left
            </span>
          </div>
        )}
      </div>

   
      <div className="card-body d-flex flex-column p-3">
     
        <h5 
          className="card-title mb-2 fw-bold text-truncate" 
          style={{ 
            fontSize: '1rem',
            color: '#212529',
            lineHeight: '1.4'
          }}
          title={product.product_name}
        >
          {product.product_name}
        </h5>
        

        <p 
          className="card-text text-muted mb-2" 
          style={{ 
            fontSize: '0.875rem',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.6rem'
          }}
        >
          {product.description || 'No description available'}
        </p>
        
        
        {(rating > 0 || reviewCount > 0) && (
          <div className="d-flex align-items-center gap-2 mb-3">
            <StarRating rating={rating} />
            <span className="text-muted small">
              <span className="fw-semibold text-dark">{ratingDisplay}</span>
              <span className="ms-1">({reviewCount})</span>
            </span>
          </div>
        )}
      
        <div className="mt-auto pt-3 border-top">
        
          <div className="mb-2 text-center">
            <span 
              className="d-block fw-bold" 
              style={{ 
                fontSize: '1.5rem',
               color: '#8B5A2B', 



                lineHeight: '1',
                letterSpacing: '-0.5px'
              }}
            >
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

         
          <button 
            className={`btn btn-sm d-flex align-items-center justify-content-center gap-2 ${
              product.stock_quantity === 0 
                ? 'btn-secondary' 
                : 'btn-nut-brown'

            }`}
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0 || isAdding}
            style={{ 
              fontSize: '0.875rem',
              padding: '0.5rem 1rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              width: '100%',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
              boxShadow: product.stock_quantity === 0 
  ? 'none' 
  : '0 2px 8px rgba(139, 90, 43, 0.35)',

              textTransform: 'none',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => {
              if (product.stock_quantity > 0 && !isAdding) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 90, 43, 0.45)';

              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = product.stock_quantity === 0 ? 'none' : '0 2px 8px rgba(13, 110, 253, 0.25)';
            }}
          >
            {isAdding ? (
              <>
                <span 
                  className="spinner-border spinner-border-sm" 
                  style={{ width: '1rem', height: '1rem' }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </span>
                <span>Adding...</span>
              </>
            ) : product.stock_quantity === 0 ? (
              <span>Sold Out</span>
            ) : (
              <>
                <FaShoppingCart size={15} style={{
                 
                  color: '#fff',          
                    }}
 />
                <span style={{ color: '#fff' }}>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;