import { useEffect, useState } from 'react';
import {
  FaArrowRight,
  FaShoppingBag,
  FaSpinner,
  FaStar
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { aiService } from '../services/api';
import './HomePage.css';
import heroBgImage from './images/hero-bg.jpg';

const HomePage = () => {
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPopularProducts();
  }, []);

  const loadPopularProducts = async () => {
    try {
      const response = await aiService.getPopularProducts(6);
      setPopularProducts(response.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const heroBgStyle = {
    backgroundImage: `url(${heroBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(1.18) contrast(1.05) saturate(1.1)'
  };

  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section
        className="hero position-relative text-white overflow-hidden"
        style={heroBgStyle}
      >
        <div className="hero-overlay position-absolute top-0 start-0 w-100 h-100"></div>

        <div className="container position-relative" style={{ zIndex: 2 }}>
          <div className="row min-vh-100 align-items-center">
            <div className="col-lg-8 col-xl-7 mx-auto text-center py-5">

              <h1 className="display-3 fw-bold mb-4 hero-title">
                Welcome to{' '}
                <span className="text-nut-brown">Gallery Dhaybi</span>
              </h1>

              <p className="lead fs-4 mb-5 hero-subtitle">
                Discover the perfect furniture for your space
              </p>

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link
                  to="/products"
                  className="btn btn-nut-brown btn-lg px-4 py-3 shadow d-flex align-items-center gap-2"
                  style={{ color: '#fff' }}
                >
                  <FaShoppingBag />
                  Shop Now
                </Link>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="popular-products py-5 bg-light">
        <div className="container py-4">

          <div className="text-center mb-5">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <FaStar className="text-warning fs-4" />
              <h2 className="display-5 fw-bold mb-0">Popular Products</h2>
              <FaStar className="text-warning fs-4" />
            </div>
            <p className="text-muted fs-5">
              Discover our most loved furniture pieces
            </p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <FaSpinner
                className="fa-spin text-secondary mb-3"
                style={{ fontSize: '3rem' }}
              />
              <p className="text-muted">Loading amazing products...</p>
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted fs-5">
                No products available at the moment
              </p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {popularProducts.map(product => (
                <div className="col" key={product.product_id}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-5">
            <Link
              to="/products"
              className="btn btn-outline-nut-brown btn-lg px-5 py-3 d-flex align-items-center gap-2 justify-content-center mx-auto"
              style={{ width: 'fit-content', color: '#fff' }}
            >
              View All Products
              <FaArrowRight />
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
};

export default HomePage;
