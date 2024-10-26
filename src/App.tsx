import { CredentialResponse, GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { Chat } from './components/Chat';
import ContractChecks from './components/ContractChecks';
import Upload from './components/Upload';
import './index.css';
import { apiClient } from './services/axiosConfig';
import { useAuthStore } from './stores/authStore';

function App() {
  const { access_token, exp, isLoggedIn, setAccessToken, setExp, setUserId, isExpired, logout, setIsLoggedIn } = useAuthStore();

  // Add 'dark' class to the root to apply dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    setIsLoggedIn(!isExpired());
  }, []);

  useEffect(() => {
    if (!access_token) {
      setIsLoggedIn(false);
    } else {
      if (exp) {
        setIsLoggedIn(!isExpired());
      }
    }
  }, [access_token]);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const auth_token = credentialResponse.credential;
    if (!auth_token) {
      console.error('Error during login: token is invalid');
      return;
    }
    // console.log('auth ' + auth_token);
    apiClient
      .post('/auth/google', { auth_token })
      .then(response => {
        if (response.data && response.data.access_token) {
          setAccessToken(response.data.access_token);
          setExp(parseFloat(response.data.exp));
          setUserId(response.data.user_id);
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
            onError={() => {}}
          />
        </div>
      )}
      {isLoggedIn && (
        <div className="flex h-screen w-screen basis-full flex-row content-center justify-center text-textPrimary subpixel-antialiased dark:bg-darkBg3">
          <ContractChecks />
          <Chat />
          <Upload />
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
