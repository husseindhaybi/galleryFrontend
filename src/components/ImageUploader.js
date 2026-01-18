import axios from 'axios';
import { useRef, useState } from 'react';
import { FaCamera, FaStar, FaTimes, FaUpload } from 'react-icons/fa';
import Swal from 'sweetalert2';
import './ImageUploader.css';

const ImageUploader = ({ productId, onImagesChange }) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // ضغط الصورة باستخدام Canvas
  const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // تصغير الصورة إذا كانت أكبر من الحد المسموح
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height / width) * maxWidth;
              width = maxWidth;
            } else {
              width = (width / height) * maxHeight;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const isUnder20MB = file.size <= 20 * 1024 * 1024; // زدنا الحد لأنو بنضغط
      return isUnder20MB;
    });

    if (validFiles.length !== files.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Some Files Were Skipped',
        text: 'Only files under 20MB are allowed.',
        confirmButtonText: 'OK'
      });
    }

    if (validFiles.length === 0) return;

    // عرض loading
    setCompressing(true);

    try {
      // ضغط كل الصور
      const compressedPreviews = await Promise.all(
        validFiles.map(async (file) => {
          try {
            console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            const compressedFile = await compressImage(file);
            console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            
            return {
              file: compressedFile,
              preview: URL.createObjectURL(compressedFile),
              name: file.name
            };
          } catch (error) {
            console.error('Compression error:', error);
            // إذا فشل الضغط، استخدم الملف الأصلي
            return {
              file: file,
              preview: URL.createObjectURL(file),
              name: file.name
            };
          }
        })
      );

      setPreviews([...previews, ...compressedPreviews]);
    } catch (error) {
      console.error('Error processing images:', error);
    } finally {
      setCompressing(false);
    }
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
      console.error('Upload error:', error);

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
        onClick={() => !compressing && fileInputRef.current?.click()}
      >
        <FaUpload className="upload-icon" />
        <h3>Drag & Drop Images Here</h3>
        <p>or click to browse</p>
        <span className="upload-note">All image formats (Images will be compressed automatically)</span>
      </div>

      {/* Mobile Button - للموبايل */}
      <div className="d-md-none">
        <button
          type="button"
          className="btn btn-primary btn-lg w-100 py-4 d-flex align-items-center justify-content-center gap-3"
          onClick={() => !compressing && fileInputRef.current?.click()}
          disabled={compressing}
        >
          <FaCamera size={24} />
          <span>{compressing ? 'Compressing...' : 'Choose Images'}</span>
        </button>
        <p className="text-center text-muted mt-2 small">
          Images will be compressed automatically for faster upload
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        aria-label="Upload product images"
        disabled={compressing}
      />

      {compressing && (
        <div className="text-center my-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Compressing...</span>
          </div>
          <p className="mt-2">Compressing images...</p>
        </div>
      )}

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
            disabled={uploading || compressing}
          >
            {uploading ? 'Uploading...' : `Upload ${previews.length} Image${previews.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;