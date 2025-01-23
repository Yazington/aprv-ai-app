import { CredentialResponse, GoogleOAuthProvider } from '@react-oauth/google';
import { useEffect } from 'react';
import { IoMenuOutline } from 'react-icons/io5';
import { ThemeProvider } from './components/ui/theme-provider';
import { Chat } from './components/Chat';
import LeftLayout from './components/LeftLayout';
import './index.css';
import { apiClient } from './services/axiosConfig';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';
import { NetworkLines } from './components/NetworkLines';
import GoogleSignInButton from './components/GoogleSignInButton';
import RightLayout from './components/RightLayout';

function App() {
  const { access_token, exp, isLoggedIn, setAccessToken, setExp, setUserId, isExpired, logout, setIsLoggedIn } = useAuthStore();
  const { isSidebarExpanded, toggleSidebar } = useUIStore();

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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
    >
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
          <div className="login-box shadow-xs relative z-10 flex flex-col items-center justify-center gap-6 rounded-2xl border border-lightBg1/20 bg-lightBg1/10 p-8 backdrop-blur-lg dark:border-darkBg4 dark:bg-darkBg1/10">
            <img
              src="/FullLogo3.png"
              alt="APRV AI Logo"
              className="w-40"
            />
            <div className="mx-auto flex items-center justify-between text-textSecondary">
              <span className="flex h-[28px] items-center">Intelligent Brand Guidelines</span>
            </div>
            <GoogleSignInButton onSuccess={handleSuccess} />
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-lightBg1 to-lightBg2 text-textPrimary subpixel-antialiased dark:from-darkBg1 dark:to-darkBg1">
          {/* Main content wrapper */}
          <div className="relative flex h-full flex-col md:flex-row">
            {/* Menu button - visible only on mobile */}
            <button 
              onClick={toggleSidebar}
              className="fixed left-4 top-4 z-[60] block rounded-lg bg-gray-100 p-1.5 md:p-2 shadow-lg dark:bg-darkBg2 md:hidden"
            >
              <IoMenuOutline className="h-4 w-4 md:h-6 md:w-6 text-gray-700 dark:text-textPrimary" />
            </button>

            {/* Sidebar with responsive behavior */}
            <div 
              className={`fixed md:relative md:block transform transition-all duration-300 ease-in-out
                ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                z-50 h-full w-full md:w-64
              `}
            >
              <LeftLayout />
            </div>

            {/* Main content area */}
            <div className="flex-1 overflow-hidden bg-lightBg2 pt-16 md:pt-0 dark:bg-darkBg1">
              <Chat />
            </div>

            {/* Right sidebar - hidden on mobile, visible on desktop */}
            <div className="hidden md:block md:w-[240px] bg-lightBg2 dark:bg-darkBg1">
              <RightLayout />
            </div>
          </div>
        </div>
      )}
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;
