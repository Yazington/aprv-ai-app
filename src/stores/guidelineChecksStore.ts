import { create } from 'zustand';
import { PageReview as PageReview } from '../types/PageReview';

interface GuidelineChecksStore {
  reviews: PageReview[];

  setConversationReviews: (reviews: PageReview[]) => void;

  addReviewsForConversation: (reviews: PageReview[]) => void;
  reset: () => Promise<void>;
}
const initialState = {
  reviews: [],
};
export const useGuidelineChecksStore = create<GuidelineChecksStore>((set, get) => ({
  ...initialState,

  setConversationReviews: (reviews: PageReview[]) => {
    set({ reviews });
  },

  addReviewsForConversation: (reviews: PageReview[]) => {
    const currentReviews = get().reviews;

    const updatedReviews = [...currentReviews, ...reviews];

    set({ reviews: updatedReviews });
  },
  reset: async () => set(initialState),
}));
