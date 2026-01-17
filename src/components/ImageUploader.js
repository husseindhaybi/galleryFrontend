import axios from 'axios';
import { useRef, useState } from 'react';
import { FaStar, FaTimes, FaUpload } from 'react-icons/fa';
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
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      const isUnder5MB = file.size <= 5 * 1024 * 1024;
      return isValid && isUnder5MB;
    });

    if (validFiles.length !== files.length) {
      Swal.fire({
  icon: 'warning',
  title: 'Some Files Were Skipped',
  text: 'Only images under 5MB are allowed.',
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
      Swal.fire({
  icon: 'error',
  title: 'Upload Failed',
  text: error.response?.data?.error || 'Failed to upload images',
  confirmButtonText: 'OK'
});

    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-uploader">
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <FaUpload className="upload-icon" />
        <h3>Drag & Drop Images Here</h3>
        <p>or click to browse</p>
        <span className="upload-note">PNG, JPG, GIF, WEBP (Max 5MB each)</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {previews.length > 0 && (
        <div className="previews-section">
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
            className="upload-btn"
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