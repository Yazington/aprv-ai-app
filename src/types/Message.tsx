export interface Message {
  conversation_id?: string;
  id?: string;
  content: string;
  is_from_human: boolean;
  created_at?: any;
  modified_at?: any;
  isStreaming: boolean;
}
