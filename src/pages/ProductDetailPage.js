import { useEffect, useState } from 'react';
import {
  FaBox,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaStar
} from 'react-icons/fa';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ProductCard from '../components/ProductCard';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import { aiService, authService, cartService, productService } from '../services/api';

const ProductDetailPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    loadProduct();
    loadSimilarProducts();
  }, [id]);

  // دالة لإصلاح مسار الصورة
  const fixImagePath = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    
    // إذا المسار كامل (http/https)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // إذا المسار بيبدأ بـ /uploads
    if (imagePath.startsWith('/uploads')) {
      return `${imagePath}`;
    }
    
    // إذا ما في /uploads، أضفها
    if (!imagePath.includes('/uploads')) {
      imagePath = `/uploads/${imagePath}`;
    }
    
    return `${imagePath}`;
  };

  const loadProduct = async () => {
    try {
      const response = await productService.getById(id);
      console.log('Product loaded:', response);
      
      setProduct(response.product);
      setReviews(response.product.reviews || []);
      
      const productImages = response.product.images || [];
      
      // إصلاح مسار الصور
      const imagesWithFixedPaths = productImages.map(img => ({
        ...img,
        image_url: fixImagePath(img.image_url)
      }));
      
      setImages(imagesWithFixedPaths);
      
      const primaryImage = imagesWithFixedPaths.find(img => img.is_primary) || imagesWithFixedPaths[0];
      
      if (primaryImage) {
        setSelectedImage(primaryImage);
      } else {
        // إذا ما في صور، استخدم الصورة الرئيسية للمنتج
        setSelectedImage({ 
          image_url: fixImagePath(response.product.image_url || response.product.imageUrl || response.product.image) 
        });
      }
      
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarProducts = async () => {
    try {
      const response = await aiService.getSimilarProducts(id, 4);
      
      // إصلاح مسار صور المنتجات المشابهة
      const productsWithFixedImages = (response.recommendations || []).map(prod => ({
        ...prod,
        image_url: fixImagePath(prod.image_url || prod.imageUrl || prod.image)
      }));
      
      setSimilarProducts(productsWithFixedImages);
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await cartService.addToCart(id, quantity);
      window.dispatchEvent(new Event('cartUpdated'));
      Swal.fire({
  icon: 'success',
  title: 'Added to Cart!',
  text: 'Product added to cart!',
  confirmButtonText: 'OK'
});

    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Add to Cart Failed',
  text: error.response?.data?.error || 'Failed to add to cart',
  confirmButtonText: 'OK'
});

    } finally {
      setAddingToCart(false);
    }
  };

  const handleReviewAdded = () => {
    loadProduct();
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-5">
        <FaBox className="text-muted mb-3" style={{ fontSize: '4rem' }} />
        <h3 className="text-muted">Product not found</h3>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container py-4">
        {/* Product Detail Section */}
        <div className="row g-4 mb-5">
          {/* Image Gallery */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              {/* Main Image */}
              <div className="card-body p-3">
                <div 
                  className="bg-light d-flex align-items-center justify-content-center overflow-hidden rounded"
                  style={{ height: '500px' }}
                >
                  <img 
                    src={selectedImage?.image_url || '/placeholder.jpg'} 
                    alt={product.product_name}
                    className="img-fluid"
                    style={{ maxHeight: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      console.error('Failed to load image:', e.target.src);
                      e.target.src = '/placeholder.jpg';
                    }}
                  />
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="d-flex gap-2 mt-3 overflow-auto">
                    {images.map((img, index) => (
                      <div 
                        key={img.image_id || index}
                        className={`border rounded overflow-hidden ${
                          selectedImage?.image_id === img.image_id ? 'border-primary border-3' : ''
                        }`}
                        onClick={() => setSelectedImage(img)}
                        style={{ 
                          width: '80px', 
                          height: '80px', 
                          cursor: 'pointer',
                          flexShrink: 0
                        }}
                      >
                        <img 
                          src={img.image_url} 
                          alt={`${product.product_name} - ${index + 1}`}
                          className="img-fluid w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = '/placeholder.jpg';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">
                <h1 className="h2 fw-bold mb-3">{product.product_name}</h1>
                
             
                <div className="mb-3">
                  <StarRating 
                    rating={product.avg_rating || product.average_rating || 0} 
                    totalReviews={product.review_count || product.total_reviews || 0}
                    size="large"
                  />
                </div>

                <p className="text-muted mb-4">{product.description}</p>

                {/* Product Details */}
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body p-3">
                    <h6 className="fw-bold mb-3">Product Details</h6>
                    <div className="row g-2 small">
                      <div className="col-6 d-flex align-items-center gap-2">
                        
                        <span><strong>Category:</strong> {product.category_name}</span>
                      </div>
                      
                     
                    </div>
                  </div>
                </div>

              
                <div className="border-top border-bottom py-3 mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                     
                      <h2 className="h3 fw-bold mb-0" style={{ color: '#8B5A2B' }}>
                        ${Number(product.price).toFixed(2)}
                      </h2>
                    </div>
                    <div>
                      {product.stock_quantity > 0 ? (
                        <span className="badge bg-success">
                          In Stock ({product.stock_quantity} available)
                        </span>
                      ) : (
                        <span className="badge bg-danger">Out of Stock</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add to Cart Section */}
                {product.stock_quantity > 0 && (
                  <div className="mt-4">
                    <div className="row g-3">
                      {/* Quantity Selector */}
                      <div className="col-auto">
                        <div className="btn-group" role="group" style={{ height: '48px' }}>
                          <button 
                            className="btn btn-outline-secondary"
                            style={{ width: '48px' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuantity(Math.max(1, quantity - 1));
                            }}
                            disabled={quantity <= 1}
                            type="button"
                          >
                            <FaMinus size={14} />
                          </button>
                          
                          <div 
                            className="btn btn-outline-secondary"
                            style={{ 
                              width: '60px',
                              backgroundColor: 'white',
                              color: 'black',
                              fontWeight: 'bold',
                              cursor: 'default',
                              pointerEvents: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            {quantity}
                          </div>
                          
                          <button 
                            className="btn btn-outline-secondary"
                            style={{ width: '48px' }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setQuantity(Math.min(product.stock_quantity, quantity + 1));
                            }}
                            disabled={quantity >= product.stock_quantity}
                            type="button"
                          >
                            <FaPlus size={14} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="col">
                        <button 
  className="btn btn-nut-brown btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
  style={{ height: '48px' }}
  onClick={(e) => {
    e.preventDefault();
    handleAddToCart();
  }}
  disabled={addingToCart}
  type="button"
>
  {addingToCart ? (
    <>
      <span className="spinner-border spinner-border-sm" />
      <span>Adding...</span>
    </>
  ) : (
    <>
      <FaShoppingCart style={{ color: '#fff' }} />
      <span style={{ color: '#fff' }}> Add to Cart</span>
    </>
  )}
</button>

                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products Section */}
        {similarProducts.length > 0 && (
          <section className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-4">
              <FaStar className="text-warning" />
              <h2 className="h3 fw-bold mb-0">AI Recommended Products</h2>
            </div>
            <p className="text-muted mb-4">Products similar to what you're viewing</p>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {similarProducts.map(prod => (
                <div className="col" key={prod.product_id}>
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section>
          <h2 className="h3 fw-bold mb-4">Customer Reviews</h2>

          {/* Add Review Form */}
          {isAuthenticated && (
            <div className="mb-4">
              <ReviewForm productId={id} onReviewAdded={handleReviewAdded} />
            </div>
          )}

          {/* Reviews List */}
          <div className="row g-3">
            {reviews.length > 0 ? (
              reviews.map(review => (
                <div key={review.review_id} className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold mb-1">
                            {review.full_name || review.username || 'Anonymous'}
                          </h6>
                          <StarRating rating={review.rating} size="small" />
                        </div>
                        <small className="text-muted">
                          {review.created_at 
                            ? new Date(review.created_at).toLocaleDateString()
                            : review.review_date
                            ? new Date(review.review_date).toLocaleDateString()
                            : 'N/A'
                          }
                        </small>
                      </div>
                      {(review.review_text || review.comment) && (
                        <p className="text-muted mb-0">{review.review_text || review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12">
                <div className="alert alert-info">
                  No reviews yet. Be the first to review!
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailPage;