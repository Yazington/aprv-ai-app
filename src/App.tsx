import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import ContractChecks from './components/ContractChecks';
import Upload from './components/Upload';
import './index.css';
import { apiClient } from './services/axiosConfig';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));

  useEffect(() => {
    // Add 'dark' class to the root to apply dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  // Sync state with localStorage for access token
  useEffect(() => {
    const checkLoginStatus = () => {
      console.log('here');
      const token = localStorage.getItem('access_token');
      const expirationDate = localStorage.getItem('exp');

      if (!token || (expirationDate && parseFloat(expirationDate) < Date.now() / 1000)) {
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(true);
      }
      setAccessToken(token); // Sync the access token state with localStorage
    };

    // Run the checkLoginStatus once when the component mounts
    checkLoginStatus();

    // Add an event listener to listen for storage changes in the same tab or across tabs
    window.addEventListener('storage', checkLoginStatus);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setIsLoggedIn(false);
    } else {
      const expirationDate = localStorage.getItem('exp');
      if (expirationDate) {
        const expirationDateFloat = parseFloat(expirationDate);
        if (expirationDate && expirationDateFloat < Date.now() / 1000) {
          setIsLoggedIn(false);
        } else if (expirationDate) {
          setIsLoggedIn(true);
        }
      }
    }
  }, [accessToken]);

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('exp');
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
    setAccessToken(null); // Update state to trigger rerender
  }
  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const auth_token = credentialResponse.credential;
    if (!auth_token) {
      console.error('Error during login: token is invalid');
      return;
    }

    apiClient
      .post('/auth/google', { auth_token }, { headers: { 'Content-Type': 'application/json' } })
      .then(response => {
        if (response.data && response.data.access_token) {
          localStorage.setItem('access_token', response.data.access_token);
          localStorage.setItem('exp', response.data.exp);
          localStorage.setItem('user_id', response.data.user_id);
          setIsLoggedIn(true);
        } else {
          logout();
          alert('Server issue');
          throw new Error('Server issue');
        }
      })
      .catch(error => {
        logout();
        console.error('Error during login:', error);
      });
  };

  return (
    <GoogleOAuthProvider clientId="460411803550-aq1oq8hcss0t184ti7ui3odaabb8ntbu.apps.googleusercontent.com">
      {!isLoggedIn && (
        <div className="flex h-screen w-screen flex-1 flex-col items-center justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              console.log('Login failed');
            }}
          />
        </div>
      )}
      {isLoggedIn && (
        <div className="flex h-screen w-screen content-center justify-center font-paji font-extralight tracking-wide text-textPrimary subpixel-antialiased dark:bg-darkBg3">
          <ContractChecks />
          <Chat />
          <Upload setIsLoggedIn={setIsLoggedIn} />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
