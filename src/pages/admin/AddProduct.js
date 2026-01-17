import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import AdminLayout from '../../components/AdminLayout';
import ImageUploader from '../../components/ImageUploader';
import { aiService, productService } from '../../services/api';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProductId, setNewProductId] = useState(null);
  const [step, setStep] = useState(1);

  const [generating, setGenerating] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  
  const [aiForm, setAiForm] = useState({
    material: '',
    color: '',
    dimensions: '',
    style: '',
  });

 
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    material: '',
    color: '',
    style: '',
    dimensions: ''
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

 
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    
    if (type === 'number' || name === 'price' || name === 'stock_quantity' || name === 'category_id') {
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const product_name = (formData.product_name || '').trim();
    const description = (formData.description || '').trim();
    const material = (formData.material || '').trim();
    const color = (formData.color || '').trim();
    const style = (formData.style || '').trim();
    const dimensions = (formData.dimensions || '').trim();

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock_quantity);
    const categoryNum = Number(formData.category_id);

    if (!product_name) {
      Swal.fire({
  icon: 'warning',
  title: 'Missing Information',
  text: 'Product name is required',
  confirmButtonText: 'OK'
});

      return;
    }

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      Swal.fire({
  icon: 'warning',
  title: 'Invalid Price',
  text: 'Please enter a valid price',
  confirmButtonText: 'OK'
});

      return;
    }

    if (!Number.isFinite(categoryNum) || categoryNum <= 0) {
      Swal.fire({
  icon: 'warning',
  title: 'Category Required',
  text: 'Please select a category',
  confirmButtonText: 'OK'
});

      return;
    }

    if (!Number.isFinite(stockNum) || stockNum < 0) {
     Swal.fire({
  icon: 'warning',
  title: 'Invalid Stock Quantity',
  text: 'Please enter a valid stock quantity',
  confirmButtonText: 'OK'
});

      return;
    }


    const payload = {
      product_name,
      description,
      price: priceNum,
      category_id: categoryNum,
      stock_quantity: stockNum,
      material: material || null,
      color: color || null,
      style: style || null,
      dimensions: dimensions || null,
    };

    console.log('FINAL DATA SENT TO BACKEND:', payload);

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setNewProductId(data.product_id);
        setStep(2);
        Swal.fire({
  icon: 'success',
  title: 'Product Created!',
  text: 'Now add images to complete the setup.',
  confirmButtonText: 'OK'
});

      } else {
        Swal.fire({
  icon: 'error',
  title: 'Failed to Add Product',
  text: data.error || 'Failed to add product',
  confirmButtonText: 'OK'
});

      }
    } catch (error) {
      console.error(error);
      Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'Failed to add product',
  confirmButtonText: 'OK'
});

    } finally {
      setLoading(false);
    }
  };

  const handleImagesUploaded = () => {
    Swal.fire({
  icon: 'success',
  title: 'Success!',
  text: 'Product and images added successfully!',
  confirmButtonText: 'Great!'
});

    navigate('/admin/products');
  };

  const skipImages = () => {
    if (window.confirm('Skip image upload?')) {
      navigate('/admin/products');
    }
  };

  const getCategoryNameById = (id) => {
    const cat = categories.find(c => String(c.category_id) === String(id));
    return cat ? cat.category_name : '';
  };


  const handleGenerateDescription = async () => {
    if (!formData.product_name.trim()) {
      Swal.fire({
  icon: 'warning',
  title: 'Product Name Required',
  text: 'Enter product name first',
  confirmButtonText: 'OK'
});

      return;
    }

    try {
      setGenerating(true);

      const res = await aiService.generateProductDescription({
        product_name: formData.product_name,
        category_name: getCategoryNameById(formData.category_id),
        extra_info: `
Material: ${aiForm.material}
Color: ${aiForm.color}
Dimensions: ${aiForm.dimensions}
Style: ${aiForm.style}
        `,
        language: 'en',
      });

      if (res.success) {
      
        setFormData(prev => ({
          ...prev,
          description: (res.raw_content || '').trim(),
          material: (aiForm.material || '').trim(),
          color: (aiForm.color || '').trim(),
          style: (aiForm.style || '').trim(),
          dimensions: (aiForm.dimensions || '').trim()
        }));
        setShowAIModal(false);
      } else {
        Swal.fire({
  icon: 'error',
  title: 'Description Error',
  text: res.error || 'Failed to generate description',
  confirmButtonText: 'OK'
});

      }
    } catch (err) {
      console.error(err);
      Swal.fire({
  icon: 'error',
  title: 'Error',
  text: 'Error generating description',
  confirmButtonText: 'OK'
});

    } finally {
      setGenerating(false);
    }
  };


  const closeAIModal = () => {
    if (generating) return;
    setShowAIModal(false);
  };

  return (
    <AdminLayout>
      <div className="add-product-page container mt-4">

        {step === 1 && (
          <form onSubmit={handleSubmit} className="card p-4 mb-4">

            <h2 className="h5 mb-3">Basic Information</h2>

            <div className="mb-3">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="5"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={() => setShowAIModal(true)}
              >
                Generate with AI
              </button>
            </div>

            <h2 className="h5 mt-4 mb-3">Pricing & Inventory</h2>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="form-control"
                  required
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  className="form-control"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>



            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Continue to Images →'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

       
        {step === 2 && newProductId && (
          <ImageUploader
            productId={newProductId}
            onImagesChange={handleImagesUploaded}
          />
        )}

       
        {showAIModal && (
          <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Tell AI about the product</h5>
                  <button className="btn-close" onClick={closeAIModal} />
                </div>
                <div className="modal-body">
                  {['material', 'color', 'dimensions', 'style'].map(field => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">{field}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={aiForm[field]}
                        onChange={e => setAiForm({ ...aiForm, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeAIModal} disabled={generating}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleGenerateDescription} disabled={generating}>
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AddProduct;
