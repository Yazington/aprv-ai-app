import axios, { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '../stores/authStore';

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
  baseURL: 'https://api.aprv.ai',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to check if token is expired
apiClient.interceptors.request.use(
  async config => {
    // Exclude the /auth/google endpoint
    if (config.url && config.url.includes('/auth/google')) {
      return config; // Skip token handling for this endpoint
    }

    const accessToken = useAuthStore.getState().access_token;
    const accessTokenExpiration = useAuthStore.getState().exp;
    const currentTime = Date.now() / 1000;

    if (accessToken && accessTokenExpiration) {
      if (accessTokenExpiration > currentTime) {
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
      useAuthStore.setState({ access_token: null, exp: null, user_id: null, isLoggedIn: false });
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
      useAuthStore.setState({ access_token: null, exp: null, user_id: null, isLoggedIn: false });
    }

    return Promise.reject(error);
  }
);
