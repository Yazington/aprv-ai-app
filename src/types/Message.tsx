export interface Message {
  conversation_id?: string;
  id?: string;
  content: string;
  is_from_human: boolean;
  created_at?: any;
  modified_at?: any;
  isStreaming: boolean;
  uploaded_pdf_ids?: string[];
  source_info?: {
    filename: string;
    position?: string;
  }[];
}
