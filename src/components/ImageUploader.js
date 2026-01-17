import axios from 'axios';
import { useRef, useState } from 'react';
import { FaCamera, FaStar, FaTimes, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './ImageUploader.css';

const ImageUploader = ({ productId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    // بس تحقق من الحجم - بدون تحقق من النوع
    const validFiles = files.filter(file => {
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isUnder5MB;
    });

    if (validFiles.length !== files.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Some Files Were Skipped',
        text: 'Only files under 5MB are allowed.',
        confirmButtonText: 'OK'
      });
    }

    const newPreviews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setPreviews([...previews, ...newPreviews]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removePreview = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const uploadImages = async () => {
    if (previews.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Images Selected',
        text: 'Please select at least one image',
        confirmButtonText: 'OK'
      });
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      previews.forEach(preview => {
        formData.append('images', preview.file);
      });

      console.log('Uploading images to:', `/api/uploads/product-images/${productId}`);
      console.log('Number of images:', previews.length);

      const response = await axios.post(
        `/api/uploads/product-images/${productId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Upload response:', response.data);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Upload Complete!',
          text: `${response.data.images.length} images uploaded successfully!`,
          confirmButtonText: 'OK'
        });
        setPreviews([]);
        if (onImagesChange) {
          onImagesChange(response.data.images);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // عرض تفاصيل الـ error بـ alert للموبايل
      const errorDetails = {
        status: error.response?.status,
        message: error.response?.data?.error || error.message,
        data: error.response?.data
      };
      
      alert('Upload Error:\n' + JSON.stringify(errorDetails, null, 2));

      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        html: `
          <p><strong>Error:</strong> ${error.response?.data?.error || error.message}</p>
          <p><strong>Status:</strong> ${error.response?.status || 'Unknown'}</p>
        `,
        confirmButtonText: 'OK'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      
      {/* Drag & Drop Area - للكمبيوتر */}
      <div 
        className={`upload-area d-none d-md-flex ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <FaUpload className="upload-icon" />
        <h3>Drag & Drop Images Here</h3>
        <p>or click to browse</p>
        <span className="upload-note">All image formats (Max 5MB each)</span>
      </div>

      {/* Mobile Button - للموبايل */}
      <div className="d-md-none">
        <button
          type="button"
          className="btn btn-primary btn-lg w-100 py-4 d-flex align-items-center justify-content-center gap-3"
          onClick={() => fileInputRef.current?.click()}
        >
          <FaCamera size={24} />
          <span>Choose Images</span>
        </button>
        <p className="text-center text-muted mt-2 small">
          All image formats supported (Max 5MB each)
        </p>
      </div>

      {/* Hidden File Input - بقبل كل شي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="*/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Upload product images"
      />

      {previews.length > 0 && (
        <div className="previews-section mt-4">
          <h3>Selected Images ({previews.length})</h3>
          <div className="previews-grid">
            {previews.map((preview, index) => (
              <div key={index} className="preview-item">
                <img src={preview.preview} alt={preview.name} />
                <button
                  className="remove-btn"
                  onClick={() => removePreview(index)}
                  type="button"
                >
                  <FaTimes />
                </button>
                {index === 0 && (
                  <span className="primary-badge">
                    <FaStar /> Primary
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            className="btn btn-success btn-lg w-100 mt-3"
            onClick={uploadImages}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;