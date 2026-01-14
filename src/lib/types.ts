// Data model types for the email client

export interface Account {
  id: string;
  email: string;
  name: string;
  provider: 'gmail' | 'outlook' | 'imap';
  color: string; // Tailwind gradient class
  needsReauth?: boolean;
  folders: Folder[];
  isPinned?: boolean; // Daily driver accounts (show as pills)
  isInFavorites?: boolean; // Included in favorites unified view
  isSnoozed?: boolean; // Temporarily hidden
  snoozeUntil?: Date; // When to un-snooze
  healthStatus?: 'good' | 'reauth' | 'failing'; // Connection health
}

export interface Folder {
  id: string;
  accountId: string;
  name: string;
  path: string; // e.g., "INBOX", "Work/Projects"
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'archive' | 'custom';
  unreadCount: number;
  threadIds: string[];
}

export interface Thread {
  id: string;
  subject: string;
  participants: Participant[];
  messageIds: string[];
  folderIds: string[]; // Can be in multiple folders (Gmail labels)
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  lastActivity: Date;
  snippet: string; // Preview text
}

export interface Message {
  id: string;
  threadId: string;
  from: Participant;
  to: Participant[];
  cc?: Participant[];
  bcc?: Participant[];
  subject: string;
  body: string;
  bodyHtml?: string;
  date: Date;
  isRead: boolean;
  attachments: Attachment[];
  inReplyTo?: string;
}

export interface Participant {
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number; // bytes
  url?: string; // Will be populated later with real data
}

export interface SearchFilters {
  query: string;
  accountId?: string;
  folderId?: string;
  isUnread?: boolean;
  hasAttachment?: boolean;
  from?: string;
  to?: string;
}

export interface SyncStatus {
  accountId: string;
  isSyncing: boolean;
  lastSyncTime?: Date;
  error?: string;
}
