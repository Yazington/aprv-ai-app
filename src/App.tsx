import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect, useState } from 'react';
import Chat from './components/Chat';
import ContractChecks from './components/ContractChecks';
import Upload from './components/Upload';
import './index.css';
import { apiClient } from './services/axiosConfig';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const accessToken = localStorage.getItem('access_token');

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
          localStorage.removeItem('access_token');
          localStorage.removeItem('exp');
          localStorage.removeItem('user_id');
          setIsLoggedIn(false);
          alert('Server issue');
          throw new Error('Server issue');
        }
      })
      .catch(error => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('exp');
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
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
        <div className="flex h-screen w-screen content-center justify-center bg-black font-paji font-extralight tracking-wide text-gray-200 subpixel-antialiased">
          <ContractChecks />
          <Chat />
          <Upload setIsLoggedIn={setIsLoggedIn} />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
