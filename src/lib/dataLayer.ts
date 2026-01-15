// Data layer API - abstracts storage from UI
// This interface will stay the same when we add real IMAP + persistence

import {
  Account,
  Folder,
  Thread,
  Message,
  SearchFilters,
  SyncStatus,
} from './types';

// In-memory store
let accounts: Account[] = [];
let folders: Folder[] = [];
let threads: Thread[] = [];
let messages: Message[] = [];
let syncStatuses: Map<string, SyncStatus> = new Map();

// Initialize function to be called by mock generator
export function initializeStore(data: {
  accounts: Account[];
  folders: Folder[];
  threads: Thread[];
  messages: Message[];
}) {
  accounts = data.accounts;
  folders = data.folders;
  threads = data.threads;
  messages = data.messages;
  data.accounts.forEach((account) => {
    syncStatuses.set(account.id, {
      accountId: account.id,
      isSyncing: false,
      lastSyncTime: new Date(),
    });
  });
}

// Account functions
export function getAccounts(): Account[] {
  return [...accounts];
}

export function getAccount(accountId: string): Account | undefined {
  return accounts.find((a) => a.id === accountId);
}

export function updateAccountReauthStatus(accountId: string, needsReauth: boolean): void {
  const account = accounts.find((a) => a.id === accountId);
  if (account) {
    account.needsReauth = needsReauth;
  }
}

// Folder functions
export function getFolders(accountId: string): Folder[] {
  return folders.filter((f) => f.accountId === accountId);
}

export function getFolder(folderId: string): Folder | undefined {
  return folders.find((f) => f.id === folderId);
}

export function getFolderByPath(accountId: string, path: string): Folder | undefined {
  return folders.find((f) => f.accountId === accountId && f.path === path);
}

// Thread functions
export function listThreads(folderId?: string, accountId?: string): Thread[] {
  let filtered = [...threads];

  if (folderId) {
    filtered = filtered.filter((t) => t.folderIds.includes(folderId));
  } else if (accountId) {
    const accountFolderIds = folders
      .filter((f) => f.accountId === accountId)
      .map((f) => f.id);
    filtered = filtered.filter((t) =>
      t.folderIds.some((fid) => accountFolderIds.includes(fid))
    );
  }

  return filtered.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

export function getUnifiedInbox(): Thread[] {
  const inboxFolderIds = folders
    .filter((f) => f.type === 'inbox')
    .map((f) => f.id);

  const inboxThreads = threads.filter((t) =>
    t.folderIds.some((fid) => inboxFolderIds.includes(fid))
  );

  // De-duplicate by threadId (already unique, but in real app might have duplicates)
  const uniqueThreads = Array.from(
    new Map(inboxThreads.map((t) => [t.id, t])).values()
  );

  return uniqueThreads.sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );
}

export function getThread(threadId: string): Thread | undefined {
  return threads.find((t) => t.id === threadId);
}

export function getThreadMessages(threadId: string): Message[] {
  return messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Thread actions
export function markThreadRead(threadId: string, isRead: boolean): void {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    thread.isRead = isRead;
    // Also mark all messages in thread
    messages
      .filter((m) => m.threadId === threadId)
      .forEach((m) => (m.isRead = isRead));
    updateFolderUnreadCounts(thread.folderIds);
  }
}

export function toggleThreadStar(threadId: string): void {
  const thread = threads.find((t) => t.id === threadId);
  if (thread) {
    thread.isStarred = !thread.isStarred;
  }
}

export function archiveThread(threadId: string): void {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  // Remove from inbox, add to archive
  const inboxFolderIds = thread.folderIds.filter((fid) => {
    const folder = folders.find((f) => f.id === fid);
    return folder?.type === 'inbox';
  });

  const archiveFolders = folders.filter(
    (f) => f.type === 'archive' && inboxFolderIds.some((ifid) => {
      const inboxFolder = folders.find((inf) => inf.id === ifid);
      return inboxFolder?.accountId === f.accountId;
    })
  );

  thread.folderIds = thread.folderIds.filter((fid) => !inboxFolderIds.includes(fid));
  archiveFolders.forEach((af) => {
    if (!thread.folderIds.includes(af.id)) {
      thread.folderIds.push(af.id);
    }
  });

  updateFolderThreadLists();
}

export function moveThreadToFolder(threadId: string, targetFolderId: string): void {
  const thread = threads.find((t) => t.id === threadId);
  const targetFolder = folders.find((f) => f.id === targetFolderId);
  if (!thread || !targetFolder) return;

  // Remove from all folders of the same account
  const accountFolderIds = folders
    .filter((f) => f.accountId === targetFolder.accountId)
    .map((f) => f.id);

  thread.folderIds = thread.folderIds.filter((fid) => !accountFolderIds.includes(fid));
  thread.folderIds.push(targetFolderId);

  updateFolderThreadLists();
}

export function trashThread(threadId: string): void {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  // Move to trash folder(s)
  const currentAccountIds = new Set(
    thread.folderIds.map((fid) => folders.find((f) => f.id === fid)?.accountId)
  );

  const trashFolders = folders.filter(
    (f) => f.type === 'trash' && currentAccountIds.has(f.accountId)
  );

  thread.folderIds = trashFolders.map((f) => f.id);
  updateFolderThreadLists();
}

export function markAsSpam(threadId: string): void {
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return;

  const currentAccountIds = new Set(
    thread.folderIds.map((fid) => folders.find((f) => f.id === fid)?.accountId)
  );

  const spamFolders = folders.filter(
    (f) => f.type === 'spam' && currentAccountIds.has(f.accountId)
  );

  thread.folderIds = spamFolders.map((f) => f.id);
  updateFolderThreadLists();
}

// Search
export function searchThreads(filters: SearchFilters): Thread[] {
  let results = [...threads];

  if (filters.accountId) {
    const accountFolderIds = folders
      .filter((f) => f.accountId === filters.accountId)
      .map((f) => f.id);
    results = results.filter((t) =>
      t.folderIds.some((fid) => accountFolderIds.includes(fid))
    );
  }

  if (filters.folderId) {
    results = results.filter((t) => t.folderIds.includes(filters.folderId!));
  }

  if (filters.isUnread !== undefined) {
    results = results.filter((t) => t.isRead !== filters.isUnread);
  }

  if (filters.hasAttachment) {
    results = results.filter((t) => {
      const threadMessages = messages.filter((m) => m.threadId === t.id);
      return threadMessages.some((m) => m.attachments.length > 0);
    });
  }

  if (filters.from) {
    results = results.filter((t) =>
      t.participants.some((p) =>
        p.email.toLowerCase().includes(filters.from!.toLowerCase()) ||
        p.name.toLowerCase().includes(filters.from!.toLowerCase())
      )
    );
  }

  if (filters.to) {
    const threadIdsWithTo = new Set(
      messages
        .filter((m) =>
          m.to.some((p) =>
            p.email.toLowerCase().includes(filters.to!.toLowerCase()) ||
            p.name.toLowerCase().includes(filters.to!.toLowerCase())
          )
        )
        .map((m) => m.threadId)
    );
    results = results.filter((t) => threadIdsWithTo.has(t.id));
  }

  if (filters.query) {
    const query = filters.query.toLowerCase();
    results = results.filter((t) => {
      const subjectMatch = t.subject.toLowerCase().includes(query);
      const snippetMatch = t.snippet.toLowerCase().includes(query);
      const threadMessages = messages.filter((m) => m.threadId === t.id);
      const bodyMatch = threadMessages.some((m) =>
        m.body.toLowerCase().includes(query)
      );
      return subjectMatch || snippetMatch || bodyMatch;
    });
  }

  return results.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
}

// Sync status
export function getSyncStatus(accountId: string): SyncStatus | undefined {
  return syncStatuses.get(accountId);
}

export function getAllSyncStatuses(): SyncStatus[] {
  return Array.from(syncStatuses.values());
}

export function updateSyncStatus(status: SyncStatus): void {
  syncStatuses.set(status.accountId, status);
}

// Helper functions
function updateFolderThreadLists(): void {
  folders.forEach((folder) => {
    folder.threadIds = threads
      .filter((t) => t.folderIds.includes(folder.id))
      .map((t) => t.id);
  });
  updateFolderUnreadCounts(folders.map((f) => f.id));
}

function updateFolderUnreadCounts(folderIds: string[]): void {
  folderIds.forEach((folderId) => {
    const folder = folders.find((f) => f.id === folderId);
    if (folder) {
      const folderThreads = threads.filter((t) => t.folderIds.includes(folderId));
      folder.unreadCount = folderThreads.filter((t) => !t.isRead).length;
    }
  });
}

// Add new thread (for sync simulator)
export function addThread(thread: Thread): void {
  threads.push(thread);
  updateFolderThreadLists();
}

// Add new message (for sync simulator)
export function addMessage(message: Message): void {
  messages.push(message);
}

