import React from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (credentialResponse: CredentialResponse) => void;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess }) => {
  return (
    <div className="w-full max-w-[320px]">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={() => {}}
        type="standard"
        theme="filled_black"
        size="large"
        shape="pill"
        width="320"
        text="continue_with"
        useOneTap
      />
    </div>
  );
};

export default GoogleSignInButton;
