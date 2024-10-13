import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';

// export const getTokenExpiration = (token: string) => {
//   const decoded = jwtDecode(token);
//   if (!decoded || !decoded.exp) {
//     return null;
//   }
//   return decoded.exp * 1000;
// };

export const getUserId = (token: string) => {
  const decoded = jwtDecode(token);
  if (!decoded || !decoded.exp) {
    return null;
  }
  return decoded.exp * 1000;
};

// Create an Axios instance
export const apiClient = axios.create({
  baseURL: 'http://localhost:9000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to check if token is expired
apiClient.interceptors.request.use(
  async config => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const accessTokenExpiration = localStorage.getItem('exp');
    const currentTime = Date.now() / 1000;

    if (accessToken && accessTokenExpiration) {
      const accessTokenExpirationFloat = parseFloat(accessTokenExpiration);

      if (accessTokenExpirationFloat < currentTime && refreshToken) {
        // Token expired but we have a refresh token, attempt to refresh
        try {
          const response = await apiClient.post('/auth/refresh-token', { token: refreshToken });
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('exp', response.data.expiration);
          config.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
        } catch (refreshError) {
          console.error('Unable to refresh token, please log in again.');
          return Promise.reject('Token expired and refresh failed');
        }
      } else {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercept responses to update local storage if necessary
apiClient.interceptors.response.use(
  response => {
    // console.log(response);
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('exp');
      localStorage.removeItem('user_id');
    }

    return response;
  },
  (error: AxiosError) => {
    // console.log(error.status);
    // console.log(JSON.stringify(error));
    // Handle response errors, such as token expiration or unauthorized access
    if (error.status === 401 || (error.response && error.response.status === 401)) {
      console.error('Unauthorized, possibly due to expired token');
      // Optional: You could clear localStorage or take other actions
      localStorage.removeItem('access_token');
      localStorage.removeItem('exp');
      localStorage.removeItem('user_id');
      window.dispatchEvent(new StorageEvent('storage'));
    }

    return Promise.reject(error);
  }
);
