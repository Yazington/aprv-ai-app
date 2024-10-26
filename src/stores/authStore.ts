import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {} from '@redux-devtools/extension'; // required for devtools typing
import { useConversationStore } from './conversationsStore';
import { useGuidelineChecksStore } from './guidelineChecksStore';

interface AuthStore {
  access_token: string | null;
  exp: number | null; //number of seconds since first jan...
  user_id: string | null;
  isLoggedIn: boolean;

  setAccessToken: (access_token: string | null) => void;
  setExp: (exp: number | null) => void;
  setUserId: (user_id: string | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;

  isExpired: () => boolean;
  logout: () => void;
}
const initialState = {
  access_token: null,
  exp: null,
  user_id: null,
  isLoggedIn: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setAccessToken: access_token => set({ access_token }),
      setExp: exp => set({ exp }),
      setUserId: user_id => set({ user_id }),
      setIsLoggedIn: isLoggedIn => set({ isLoggedIn }),
      // @ts-ignore
      logout: () => {
        set(initialState);
        useConversationStore.getState().reset();
        useGuidelineChecksStore.getState().reset();
      },
      isExpired: () => {
        console.log('Checking if token is expired');
        const { access_token, exp } = get();

        if (!access_token || (exp && exp < Date.now() / 1000)) {
          return true;
        } else {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
