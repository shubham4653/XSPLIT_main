export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const fetchApi = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    // Ensure cookies (JWT) are sent with every request
    credentials: 'include',
  };

  try {
    const res = await fetch(url, config);
    
    // Parse response
    let data;
    try {
      data = await res.json();
    } catch (err) {
      data = null;
    }

    if (!res.ok) {
      // Handle 401 Unauthorized globally (e.g. token expired)
      if (res.status === 401 && typeof window !== 'undefined') {
        // If not already on login page, redirect
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      const errorMsg = data?.error?.message || 'Something went wrong';
      const error = new Error(errorMsg);
      error.code = data?.error?.code;
      throw error;
    }

    return data.data; // Our backend returns { success, data, error }
  } catch (error) {
    throw error;
  }
};
