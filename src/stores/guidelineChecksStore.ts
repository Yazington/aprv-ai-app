import { create } from 'zustand';
import { PageReview as PageReview } from '../types/PageReview';

interface GuidelineChecksStore {
  reviews: PageReview[];

  setConversationReviews: (reviews: PageReview[]) => void;

  addReviewsForConversation: (reviews: PageReview[]) => void;
}

export const useGuidelineChecksStore = create<GuidelineChecksStore>((set, get) => ({
  reviews: [],

  setConversationReviews: (reviews: PageReview[]) => {
    set({ reviews });
  },

  addReviewsForConversation: (reviews: PageReview[]) => {
    const currentReviews = get().reviews;

    const updatedReviews = [...currentReviews, ...reviews];

    set({ reviews: updatedReviews });
  },
}));
