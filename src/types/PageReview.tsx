export interface PageReview {
  conversation_id: string;
  page_number: number;
  review_description: string;
  guideline_achieved: boolean | null;
  created_at: Date;
  modified_at: Date;
}
