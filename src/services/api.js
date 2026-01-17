import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);



export const authService = {
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};



export const productService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/products?${params}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};



export const reviewService = {
  addReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  updateReview: async (productId, reviewId, reviewData) => {
    const response = await api.put(`/products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  deleteReview: async (productId, reviewId) => {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return response.data;
  },

  getProductReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },
};


export const cartService = {
  getCart: async () => {

    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    return {
      success: true,
      cart: cart,
      count: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  addToCart: async (productId, quantity = 1) => {
    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const existing = cart.find(item => item.product_id === productId);
    
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ 
        product_id: productId, 
        quantity,
        added_at: new Date().toISOString()
      });
    }
    
    localStorage.setItem('guestCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    return {
      success: true,
      message: 'Product added to cart',
      count: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  },

  updateCartItem: async (productId, quantity) => {
    const cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    const item = cart.find(item => item.product_id === productId);
    
    if (item) {
      item.quantity = quantity;
      localStorage.setItem('guestCart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
    
    return {
      success: true,
      message: 'Cart updated'
    };
  },

  removeFromCart: async (productId) => {
    let cart = JSON.parse(localStorage.getItem('guestCart') || '[]');
    cart = cart.filter(item => item.product_id !== productId);
    
    localStorage.setItem('guestCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    
    return {
      success: true,
      message: 'Item removed from cart'
    };
  },

  clearCart: async () => {
    localStorage.setItem('guestCart', JSON.stringify([]));
    window.dispatchEvent(new Event('cartUpdated'));
    
    return {
      success: true,
      message: 'Cart cleared'
    };
  },
};



export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId) => {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },
};



export const aiService = {
 generateProductDescription: async ({ product_name, category_name, extra_info, language }) => {
  const response = await api.post('/ai/generate-description', {
    product_name,
    category_name,
    extra_info,
    language,
  });
  return response.data;
},


  getSimilarProducts: async (productId, limit = 5) => {
    const response = await api.get(`/ai/recommendations/similar/${productId}?limit=${limit}`);
    return response.data;
  },

  getPersonalizedRecommendations: async (limit = 10) => {
    const response = await api.get(`/ai/recommendations/personalized?limit=${limit}`);
    return response.data;
  },

  getPopularProducts: async (limit = 10) => {
    const response = await api.get(`/ai/recommendations/popular?limit=${limit}`);
    return response.data;
  },

  getRecommendationsByStyle: async (style, limit = 5) => {
    const response = await api.get(`/ai/recommendations/by-style/${style}?limit=${limit}`);
    return response.data;
  },


  chatWithAI: async (message) => {
    const token = localStorage.getItem('token');
    const response = await api.post('/ai/chat', 
      { message },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data;
  },

  getChatHistory: async (limit = 20) => {
    const response = await api.get(`/ai/chat/history?limit=${limit}`);
    return response.data;
  },


  generateVisualization: async (productId, roomImageBase64) => {
    try {

      const formData = new FormData();
      formData.append('product_id', productId);
      formData.append('room_image', roomImageBase64);
      
      const token = localStorage.getItem('token');
      
 
      const response = await axios.post(
        `${API_BASE_URL}/ai/visualize/generate`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          
          },
          timeout: 60000, 
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Visualization error:', error);
      
      
      if (error.response) {
      
        throw new Error(error.response.data.error || 'Failed to generate visualization');
      } else if (error.request) {
   
        throw new Error('No response from server. Please check your connection.');
      } else {
      
        throw new Error(error.message || 'Failed to generate visualization');
      }
    }
  },

  getVisualizationHistory: async (limit = 10) => {
    const response = await api.get(`/ai/visualize/history?limit=${limit}`);
    return response.data;
  },
};

export default api;