import { CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { DarkModeToggle } from './components/DarkModeToggle';
import { Chat } from './components/Chat';
import ContractChecks from './components/ContractChecks';
import Upload from './components/Upload';
import './index.css';
import { apiClient } from './services/axiosConfig';
import { useAuthStore } from './stores/authStore';
import { NetworkLines } from './components/NetworkLines';
import GoogleSignInButton from './components/GoogleSignInButton';

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
        <div className="login-container">
          <div className="network-background"></div>
          <NetworkLines />
          <div className="network-nodes z-0">
            {Array.from({ length: 80 }).map((_, i) => {
              // Create a grid-like distribution with some randomness
              const gridSize = Math.ceil(Math.sqrt(80));
              const row = Math.floor(i / gridSize);
              const col = i % gridSize;

              // Add randomness to grid positions
              const left = (col / gridSize) * 100 + (Math.random() * 10 - 5);
              const top = (row / gridSize) * 100 + (Math.random() * 10 - 5);

              return (
                <div
                  key={i}
                  className="node"
                  style={{
                    left: `${Math.max(2, Math.min(98, left))}%`,
                    top: `${Math.max(2, Math.min(98, top))}%`,
                  }}
                />
              );
            })}
          </div>
          <svg
            width="0"
            height="0"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur
                  stdDeviation="3"
                  result="coloredBlur"
                />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
          <div className="login-box relative z-10 flex flex-col items-center justify-center gap-6 rounded-2xl border border-lightBg1/20 bg-lightBg1/10 p-8 shadow-lg backdrop-blur-lg dark:border-darkBg4 dark:bg-darkBg1/10">
            <h1 className="text-3xl font-bold text-textPrimary">Welcome to APRV AI</h1>
            <p className="text-center text-textSecondary">Sign in to continue to your workspace</p>
            <GoogleSignInButton onSuccess={handleSuccess} />
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="flex h-screen w-full flex-col bg-gradient-to-br from-lightBg1 to-lightBg2 text-textPrimary subpixel-antialiased dark:from-darkBg1 dark:to-darkBg2">
          <div className="flex h-full">
            <div className="h-full w-[240px] bg-lightBg2 dark:bg-darkBg2">
              <Upload />
            </div>
            <div className="flex-1 bg-lightBg2 dark:bg-darkBg2">
              <Chat />
            </div>
            <div className="h-full w-[240px] bg-lightBg2 dark:bg-darkBg2">
              <ContractChecks />
            </div>
          </div>
        </div>
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
