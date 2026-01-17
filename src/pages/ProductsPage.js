import { useEffect, useState } from 'react';
import { FaBox, FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);


  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, minPrice, maxPrice]);

 
  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, searchTerm, minPrice, maxPrice]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      console.log('Categories response:', response);
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedCategory) filters.category_id = selectedCategory;
      if (searchTerm) filters.search = searchTerm;
      if (minPrice) filters.min_price = minPrice;
      if (maxPrice) filters.max_price = maxPrice;

      console.log('Loading products with filters:', filters);
      const response = await productService.getAll(filters);
      console.log('Products response:', response);
      
   
      if (response && Array.isArray(response.products)) {
        setProducts(response.products);
        setTotalProducts(response.total || response.products.length);
        setTotalPages(response.total_pages || Math.ceil((response.total || response.products.length) / itemsPerPage));
      } else if (response && response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setTotalProducts(response.total || response.data.length);
        setTotalPages(response.total_pages || Math.ceil((response.total || response.data.length) / itemsPerPage));
      } else {
        console.warn('Unexpected response format:', response);
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
   
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

  
    if (startPage > 1) {
      pages.push({ key: '1', num: 1 });
      if (startPage > 2) {
        pages.push({ key: 'dots1', dots: true });
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push({ key: String(i), num: i });
    }


    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push({ key: 'dots2', dots: true });
      }
      pages.push({ key: String(totalPages), num: totalPages });
    }

    return pages;
  };

  return (
    <div className="products-page">
  
      <div className="bg-light py-5 mb-4">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="display-4 fw-bold mb-3">Our Products</h1>
              <p className="lead text-muted">Explore our collection of quality furniture</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-5">
    
        <div className="card shadow-sm mb-4">
          <div className="card-body p-3">
        
            <div className="row g-3 align-items-end">
            
              <div className="col-md-4">
                <label className="form-label small fw-semibold mb-1">Search Products</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white border-end-0">
                    <FaSearch className="text-muted" style={{ fontSize: '0.85rem' }} />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

             
              <div className="col-md-3">
                <label className="form-label small fw-semibold mb-1">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

           
              <div className="col-md-4">
                <label className="form-label small fw-semibold mb-1">Price Range</label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

            
              <div className="col-md-1 d-flex justify-content-end">
                <button 
                  onClick={clearFilters}
                  className="btn btn-sm btn-outline-secondary"
                  title="Clear all filters"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
        </div>

       
        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}


        {!loading && !error && (
          <div className="d-flex align-items-center justify-content-between mb-3">
            <p className="text-muted mb-0 small">
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, totalProducts)}</strong> of{' '}
              <strong>{totalProducts}</strong> {totalProducts === 1 ? 'product' : 'products'}
            </p>
          </div>
        )}

        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading products...</p>
          </div>
        ) : products && products.length > 0 ? (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
              {products.map((product, index) => {
                
                if (!product || !product.product_id) {
                  console.warn('Invalid product at index', index, product);
                  return null;
                }
                return (
                  <div className="col" key={product.product_id}>
                    <ProductCard product={product} />
                  </div>
                );
              })}
            </div>

            
            {totalPages > 1 && (
              <nav aria-label="Product pagination" className="mt-5">
                <ul className="pagination pagination-sm justify-content-center mb-0 gap-1">
                 
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="page-link"
                      aria-label="Previous"
                      style={{ 
                        minWidth: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px'
                      }}
                    >
                      <FaChevronLeft size={12} />
                    </button>
                  </li>

                 
                  {renderPageNumbers().map((pageItem) => {
                   
                    if (pageItem.dots) {
                      return (
                        <li key={pageItem.key} className="page-item disabled">
                          <span 
                            className="page-link" 
                            style={{ 
                              minWidth: '35px',
                              height: '35px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              background: 'transparent',
                              color: '#6c757d'
                            }}
                          >
                            ...
                          </span>
                        </li>
                      );
                    }
                    
                 
                    const isActive = pageItem.num === currentPage;
                    return (
                      <li key={pageItem.key} className={`page-item ${isActive ? 'active' : ''}`}>
                        <button
                          onClick={() => handlePageChange(pageItem.num)}
                          className="page-link"
                          style={{ 
                            minWidth: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: isActive ? '600' : '400',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px'
                          }}
                        >
                          {pageItem.num}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="page-link"
                      aria-label="Next"
                      style={{ 
                        minWidth: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #dee2e6',
                        borderRadius: '4px'
                      }}
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-5">
            <FaBox className="text-muted mb-3" style={{ fontSize: '4rem' }} />
            <h4 className="text-muted mb-2">No products found</h4>
            <p className="text-muted">Try adjusting your filters</p>
            <button 
              onClick={clearFilters}
              className="btn btn-nut-brown btn-lg px-5"

            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;