import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaImage, FaPlus, FaSearch, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';
import './ProductsManagement.css';

const ProductsManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const loadProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products || []);
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
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Loading products...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="products-management">
        <div className="page-header">
          <div>
            <h1>📦 Products Management</h1>
            <p>Manage your product catalog</p>
          </div>
          <button 
            className="btn-primary"
            onClick={() => navigate('/admin/products/add')}
          >
            <FaPlus /> Add New Product
          </button>
        </div>

    
        <div className="filters-section">
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <div className="results-count">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>

      
        <div className="table-container">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              <FaPlus size={48} />
              <h3>No products found</h3>
              <p>Start by adding your first product</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/admin/products/add')}
              >
                Add Product
              </button>
            </div>
          ) : (
            <table className="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.product_id}>
                    <td>
                      <div className="product-image">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.product_name} />
                        ) : (
                          <div className="no-image">
                            <FaImage />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="product-name">
                        {product.product_name}
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">
                        {product.category_name || 'N/A'}
                      </span>
                    </td>
                    <td className="price">${Number(product.price).toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${product.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} units` : 'Out of stock'}
                      </span>
                    </td>
                    <td>
                      <div className="rating">
                        ⭐ {product.average_rating ? Number(product.average_rating).toFixed(1) : '0.0'}
                        <span className="review-count">
                          ({product.review_count || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => navigate(`/admin/products/edit/${product.product_id}`)}
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(product.product_id, product.product_name)}
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ProductsManagement;