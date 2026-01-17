import axios from 'axios';
import { useEffect, useState } from 'react';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminLayout from '../../components/AdminLayout';
import './CategoriesManagement.css';



const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      
      if (editMode) {
       
        await axios.put(
          `/api/admin/categories/${currentCategory.category_id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        Swal.fire({
  icon: 'success',
  title: 'Updated!',
  text: 'Category updated successfully!',
  timer: 2000,
  showConfirmButton: false
});

      } else {
        
        await axios.post(
          '/api/admin/categories',
          formData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        Swal.fire({
  icon: 'success',
  title: 'Done!',
  text: 'Category added successfully!',
  timer: 2000,
  showConfirmButton: false
});

      }

      closeModal();
      loadCategories();
    } catch (error) {
      Swal.fire({
  icon: 'error',
  title: 'Error',
  text: error.response?.data?.error || 'Failed to save category',
  confirmButtonText: 'OK'
});

    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ category_name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setFormData({
      category_name: category.category_name,
      description: category.description || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentCategory(null);
    setFormData({ category_name: '', description: '' });
  };

  const deleteCategory = async (categoryId, categoryName) => {
    
    if (!window.confirm(
      ` Delete category "${categoryName}"?\n\n` +
      `This action cannot be undone.\n` +
      `If this category has products, deletion will be prevented.`
    )) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `/api/admin/categories/${categoryId}`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        Swal.fire({
  icon: 'success',
  title: 'Deleted!',
  text: 'Category deleted successfully!',
  confirmButtonText: 'OK'
});

        loadCategories();
      }
    } catch (error) {
      console.error('Delete error:', error);
      
   
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      
     
      if (errorMessage.includes('contains') || errorMessage.includes('product') || errorMessage.includes('Cannot delete')) {
   
        const countMatch = errorMessage.match(/(\d+)\s+product/i);
        const productCount = countMatch ? countMatch[1] : 'some';
        
        Swal.fire({
  icon: 'error',
  title: `Cannot Delete Category "${categoryName}"`,
  html: `
    <p>This category contains <strong>${productCount}</strong> product(s).</p>
    <p>To delete this category, you must:</p>
    <ul style="text-align:left; line-height:1.6;">
      <li>1️⃣ Move all products to another category</li>
      <li>2️⃣ Delete all products in this category first</li>
    </ul>
    <p>Then try deleting the category again.</p>
  `,
  confirmButtonText: 'OK'
});

      } else {
        Swal.fire({
  icon: 'error',
  title: 'Error',
  text: errorMessage,
  confirmButtonText: 'OK'
});

      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="loading-spinner">Loading categories...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="categories-management">
        <div className="page-header">
          <div>
            <h1> Categories Management</h1>
            <p>Organize your products by categories</p>
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <FaPlus /> Add Category
          </button>
        </div>

      
        <div className="categories-grid">
          {categories.map(category => (
            <div key={category.category_id} className="category-card">
              <div className="category-header">
                <h3>{category.category_name}</h3>
                <div className="category-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => openEditModal(category)}
                    title="Edit Category"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => deleteCategory(category.category_id, category.category_name)}
                    title="Delete Category"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <div className="empty-state">
              <h3>No categories yet</h3>
              <p>Start by adding your first category</p>
              <button className="btn-primary" onClick={openAddModal}>
                <FaPlus /> Add Category
              </button>
            </div>
          )}
        </div>

     
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editMode ? 'Edit Category' : 'Add New Category'}</h2>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={formData.category_name}
                    onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                    placeholder="e.g., Living Room, Bedroom"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn-primary">
                    {editMode ? 'Update' : 'Add'} Category
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CategoriesManagement;