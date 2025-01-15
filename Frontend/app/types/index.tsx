export interface ChatMessage {
  id: number;
  profileImage: string;
  name: string;
  lastMessage: string;
  time: string;
  hasUnreadMessage: boolean;
}
