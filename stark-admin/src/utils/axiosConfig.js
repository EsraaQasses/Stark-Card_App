import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://37.120.185.235:8000/api/',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const newConfig = { ...config };
    const token = localStorage.getItem('access_token');
    if (token) {
      newConfig.headers = {
        ...newConfig.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    newConfig.headers = {
      ...newConfig.headers,
      'Content-Type': 'application/json',
    };
    return newConfig;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest.retry) {
      originalRequest.retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('https://37.120.185.235:8000/api/users/token/refresh/', {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.access;
          localStorage.setItem('access_token', newAccessToken);

          const retryConfig = {
            ...originalRequest,
            headers: {
              ...originalRequest.headers,
              Authorization: `Bearer ${newAccessToken}`,
            },
          };
          return axiosInstance(retryConfig);
        }
        throw new Error('No refresh token available');
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      // console.error('Access forbidden - insufficient permissions');
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
