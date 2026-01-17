import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaEdit, FaImage, FaPlus, FaSearch, FaStar, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';


const ProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());
  

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  useEffect(() => {
    const pages = Math.ceil(filteredProducts.length / itemsPerPage);
    setTotalPages(pages);
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts, itemsPerPage, currentPage]);

  const loadProducts = async () => {
    try {
      const cacheBuster = Date.now();
     
      const response = await axios.get(`/api/products?limit=1000&t=${cacheBuster}`);
      
      console.log('Total products loaded:', response.data.products?.length);
      
      setImageTimestamp(cacheBuster);
      
  
      const productsWithReviews = await Promise.all(
  (response.data.products || []).map(async (product) => {
    try {
      const { data } = await axios.get(
        `/api/products/${product.product_id}/reviews`
      );

      const stats = data.statistics || {};

      return {
        ...product,
        reviews: data.reviews || [],
        average_rating: Number(
          stats.average_rating ?? stats.avg_rating ?? product.avg_rating ?? 0
        ),
        review_count: Number(
          stats.total_reviews ?? product.review_count ?? data.reviews?.length ?? 0
        )
      };
    } catch (error) {
      return {
        ...product,
        reviews: [],
        average_rating: Number(product.avg_rating || 0),
        review_count: Number(product.review_count || 0)
      };
    }
  })
);
      
      setProducts(productsWithReviews);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id == selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/admin/products/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire({
  icon: 'success',
  title: 'Deleted!',
  text: 'Product deleted successfully!',
  confirmButtonText: 'OK'
});

      loadProducts();
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Delete Failed',
  text: error.response?.data?.error || 'Failed to delete product',
  confirmButtonText: 'OK'
});

    }
  };

  const getProductImage = (product) => {
    let imagePath = product.image_url || product.imageUrl || product.image;
    
    if (!imagePath) return null;
    
    let fullPath;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      fullPath = imagePath;
    } else if (imagePath.startsWith('/uploads')) {
      fullPath = `${imagePath}`;
    } else {
      if (!imagePath.includes('/uploads')) {
        imagePath = `/uploads/${imagePath}`;
      }
      fullPath = `${imagePath}`;
    }
    
    return `${fullPath}?t=${imageTimestamp}`;
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

  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
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

  const currentProducts = getCurrentPageProducts();

  return (
    <AdminLayout>
      <div className="container-fluid p-4">
    
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1">Products Management</h1>
            <p className="text-muted mb-0">Manage your product catalog</p>
          </div>
          <button 
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => navigate('/admin/products/add')}
          >
            <FaPlus /> Add New Product
          </button>
        </div>

      
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label small fw-semibold">Search Products</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <label className="form-label small fw-semibold">Category</label>
                <select
                  className="form-select"
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

              <div className="col-md-4 text-end">
                <small className="text-muted">
                  Showing {currentProducts.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of{' '}
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </small>
              </div>
            </div>
          </div>
        </div>

     
        {filteredProducts.length === 0 ? (
          <div className="card shadow-sm">
            <div className="card-body text-center py-5">
              <FaPlus size={48} className="text-muted mb-3" />
              <h4 className="text-muted">No products found</h4>
              <p className="text-muted mb-4">
                {searchTerm || selectedCategory 
                  ? 'Try adjusting your search or filters' 
                  : 'Start by adding your first product'}
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/admin/products/add')}
              >
                Add Product
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="card shadow-sm mb-4">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '80px' }}>Image</th>
                      <th>Product Name</th>
                      <th style={{ width: '150px' }}>Category</th>
                      <th style={{ width: '100px' }}>Price</th>
                      <th style={{ width: '120px' }}>Stock</th>
                      <th style={{ width: '120px' }}>Rating</th>
                      <th style={{ width: '120px' }} className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map(product => {
                      const productImage = getProductImage(product);
                      
                      return (
                        <tr key={product.product_id}>
                          <td>
                            <div 
                              className="bg-light rounded d-flex align-items-center justify-content-center overflow-hidden"
                              style={{ width: '60px', height: '60px' }}
                            >
                              {productImage ? (
                                <img 
                                  key={productImage}
                                  src={productImage} 
                                  alt={product.product_name}
                                  className="img-fluid"
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover' 
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const parent = e.target.parentElement;
                                    if (parent && !parent.querySelector('.text-muted')) {
                                      parent.innerHTML = '<div class="text-muted d-flex align-items-center justify-content-center h-100"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"></path></svg></div>';
                                    }
                                  }}
                                />
                              ) : (
                                <FaImage className="text-muted" size={24} />
                              )}
                            </div>
                          </td>

                          <td>
                            <div className="fw-semibold text-truncate" style={{ maxWidth: '250px' }}>
                              {product.product_name}
                            </div>
                          </td>

                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {product.category_name || 'N/A'}
                            </span>
                          </td>

                          <td className="fw-bold text-success">
                            ${Number(product.price).toFixed(2)}
                          </td>

                          <td>
                            {product.stock_quantity > 0 ? (
                              <span className="badge bg-success-subtle text-success">
                                {product.stock_quantity} units
                              </span>
                            ) : (
                              <span className="badge bg-danger-subtle text-danger">
                                Out of stock
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <FaStar className="text-warning" size={14} />
                              <span className="fw-semibold">
                                {product.average_rating > 0 
                                  ? Number(product.average_rating).toFixed(1) 
                                  : '0.0'}
                              </span>
                              <small className="text-muted">
                                ({product.review_count || 0})
                              </small>
                            </div>
                          </td>

                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => navigate(`/admin/products/edit/${product.product_id}`)}
                                title="Edit Product"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(product.product_id, product.product_name)}
                                title="Delete Product"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Products pagination">
                <ul className="pagination justify-content-center mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Previous"
                    >
                      <FaChevronLeft size={12} />
                    </button>
                  </li>

                  {renderPageNumbers().map((pageItem) => {
                    if (pageItem.dots) {
                      return (
                        <li key={pageItem.key} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                    }
                    
                    const isActive = pageItem.num === currentPage;
                    return (
                      <li key={pageItem.key} className={`page-item ${isActive ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(pageItem.num)}
                        >
                          {pageItem.num}
                        </button>
                      </li>
                    );
                  })}

                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Next"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;