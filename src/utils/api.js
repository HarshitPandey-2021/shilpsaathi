const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  getHealth: () => fetchJSON(`${API_BASE_URL}/health`),

  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetchJSON(`${API_BASE_URL}/upload`, { method: 'POST', body: formData });
  },

  uploadImageStream: (file, onStage) => {
    const formData = new FormData();
    formData.append('image', file);

    return fetch(`${API_BASE_URL}/upload/stream`, { method: 'POST', body: formData });
  },

  getProducts: (artisanId = null) => {
    const url = artisanId
      ? `${API_BASE_URL}/products?artisan_id=${artisanId}`
      : `${API_BASE_URL}/products`;
    return fetchJSON(url);
  },

  getProduct: (id) => fetchJSON(`${API_BASE_URL}/products/${id}`),

  createProduct: (productData) =>
    fetchJSON(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(productData),
    }),

  updateProduct: (id, productData) =>
    fetchJSON(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    }),

  deleteProduct: (id, artisanId = null) => {
    const url = artisanId
      ? `${API_BASE_URL}/products/${id}?artisan_id=${artisanId}`
      : `${API_BASE_URL}/products/${id}`;
    return fetchJSON(url, { method: 'DELETE' });
  },

  getProductListing: (id) => fetchJSON(`${API_BASE_URL}/products/${id}/listing`),

  calculatePrice: (rawMaterialCost, hoursSpent) =>
    fetchJSON(`${API_BASE_URL}/calculate-price`, {
      method: 'POST',
      body: JSON.stringify({ rawMaterialCost, hoursSpent }),
    }),

  enhanceImage: (image) =>
    fetchJSON(`${API_BASE_URL}/enhance-image`, {
      method: 'POST',
      body: JSON.stringify({ image }),
    }),

  processVoice: (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    return fetchJSON(`${API_BASE_URL}/process-voice`, { method: 'POST', body: formData });
  },
};

export { API_BASE_URL };
