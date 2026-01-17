import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaStar, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';
import ImageUploader from '../../components/ImageUploader';
import './EditProduct.css';


const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState([]);
  
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: ''
  });

  useEffect(() => {
    loadProduct();
    loadCategories();
    loadProductImages();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      const product = response.data.product;
      
      setFormData({
        product_name: product.product_name,
        description: product.description,
        price: product.price,
        category_id: product.category_id,
        stock_quantity: product.stock_quantity
      });
    } catch (error) {
      console.error('Error loading product:', error);
      Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'Failed to load product',
  confirmButtonText: 'OK'
});

      navigate('/admin/products');
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

  const loadProductImages = async () => {
    try {
      const response = await axios.get(`/api/uploads/product-images/${id}`);
      setProductImages(response.data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `/api/admin/products/${id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Product updated successfully!',
  confirmButtonText: 'OK'
});

        navigate('/admin/products');
      }
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Update Failed',
  text: error.response?.data?.error || 'Failed to update product',
  confirmButtonText: 'OK'
});

    } finally {
      setSaving(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `/api/uploads/product-images/${imageId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire({
  icon: 'success',
  title: 'Deleted!',
  text: 'Image deleted successfully!',
  confirmButtonText: 'OK'
});

      loadProductImages();
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Delete Failed',
  text: error.response?.data?.error || 'Failed to delete image',
  confirmButtonText: 'OK'
});

    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/uploads/product-images/${imageId}/primary`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Swal.fire({
  icon: 'success',
  title: 'Updated!',
  text: 'Primary image updated!',
  confirmButtonText: 'OK'
});

      loadProductImages();
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Update Failed',
  text: error.response?.data?.error || 'Failed to update primary image',
  confirmButtonText: 'OK'
});

    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Loading product...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="edit-product-page">
        <div className="page-header">
          <div>
            <h1>✏️ Edit Product</h1>
            <p>Update product information and images</p>
          </div>
          <button onClick={() => navigate('/admin/products')} className="btn-secondary">
            ← Back to Products
          </button>
        </div>

       
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Pricing & Inventory</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>Price (USD) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary btn-large"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Product Images */}
        <div className="images-section">
          <h2>Product Images</h2>
          
          {productImages.length > 0 && (
            <div className="current-images">
              <h3>Current Images</h3>
              <div className="images-grid">
                {productImages.map(image => (
                  <div key={image.image_id} className="image-item">
                    <img src={`${image.image_url}`} alt="Product" />
                    
                    {image.is_primary && (
                      <span className="primary-badge">
                        <FaStar /> Primary
                      </span>
                    )}
                    
                    <div className="image-actions">
                      {!image.is_primary && (
                        <button
                          className="btn-icon btn-star"
                          onClick={() => handleSetPrimary(image.image_id)}
                          title="Set as primary"
                        >
                          <FaStar />
                        </button>
                      )}
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteImage(image.image_id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

      
          <div className="upload-section">
            <h3>Add More Images</h3>
            <ImageUploader 
              productId={id}
              onImagesChange={loadProductImages}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;