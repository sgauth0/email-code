// Sync simulator - periodically adds new messages and simulates sync behavior

import { Thread, Message, Participant } from './types';
import {
  addThread,
  addMessage,
  getAccounts,
  getFolders,
  updateSyncStatus,
  updateAccountReauthStatus,
  markThreadRead,
} from './dataLayer';

const mockSenders: Participant[] = [
  { name: 'David Lee', email: 'david@techcompany.com' },
  { name: 'Sofia Martinez', email: 'sofia.m@agency.co' },
  { name: 'Zoom', email: 'no-reply@zoom.us' },
  { name: 'Amazon', email: 'shipment@amazon.com' },
];

const subjectTemplates = [
  '🎯 Quick question about the project',
  'Meeting confirmed for tomorrow',
  'Your package has been delivered',
  'Action required: Please review',
  '🎉 You have been invited!',
  'Weekly team sync notes',
  'FYI: System maintenance tonight',
];

const bodyTemplates = [
  'Just wanted to follow up on our previous conversation. Let me know if you have any questions!',
  'Your meeting has been confirmed for tomorrow at 2pm. Looking forward to it!',
  'Your package has been delivered to your front door. Track your order for more details.',
  'Please review the attached document and provide your feedback by end of week.',
  'You have been invited to join our upcoming event. Please RSVP to confirm your attendance.',
  'Here are the notes from the team sync meeting. Action items are highlighted.',
  'Scheduled system maintenance will occur tonight from 11pm to 2am. Service may be briefly interrupted.',
];

let simulatorInterval: NodeJS.Timeout | null = null;
let threadCounter = 1000;
let messageCounter = 1000;

export function startSyncSimulator(
  onUpdate: () => void,
  intervalMs: number = 30000
): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
  }

  simulatorInterval = setInterval(() => {
    simulateSync(onUpdate);
  }, intervalMs);

  // Run immediately on start
  simulateSync(onUpdate);
}

export function stopSyncSimulator(): void {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
  }
}

function simulateSync(onUpdate: () => void): void {
  const accounts = getAccounts();

  accounts.forEach((account) => {
    // Start sync
    updateSyncStatus({
      accountId: account.id,
      isSyncing: true,
      lastSyncTime: new Date(),
    });

    // Simulate sync delay
    setTimeout(() => {
      const randomAction = Math.random();

      if (randomAction < 0.1) {
        // 10% chance: simulate reauth error
        updateAccountReauthStatus(account.id, true);
        updateSyncStatus({
          accountId: account.id,
          isSyncing: false,
          lastSyncTime: new Date(),
          error: 'Authentication required',
        });
      } else if (randomAction < 0.5) {
        // 40% chance: add new message
        addNewMessage(account.id);
        updateSyncStatus({
          accountId: account.id,
          isSyncing: false,
          lastSyncTime: new Date(),
        });
      } else if (randomAction < 0.7) {
        // 20% chance: mark some messages as read
        // (This would happen in real scenario from other devices)
        updateSyncStatus({
          accountId: account.id,
          isSyncing: false,
          lastSyncTime: new Date(),
        });
      } else {
        // 30% chance: no changes
        updateSyncStatus({
          accountId: account.id,
          isSyncing: false,
          lastSyncTime: new Date(),
        });
      }

      onUpdate();
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  });
}

function addNewMessage(accountId: string): void {
  const folders = getFolders(accountId);
  const inboxFolder = folders.find((f) => f.type === 'inbox');

  if (!inboxFolder) return;

  const threadId = `thread_sim_${threadCounter++}`;
  const messageId = `msg_sim_${messageCounter++}`;

  const randomSender = mockSenders[Math.floor(Math.random() * mockSenders.length)];
  const randomSubject = subjectTemplates[Math.floor(Math.random() * subjectTemplates.length)];
  const randomBody = bodyTemplates[Math.floor(Math.random() * bodyTemplates.length)];

  const accounts = getAccounts();
  const account = accounts.find((a) => a.id === accountId);

  if (!account) return;

  const message: Message = {
    id: messageId,
    threadId,
    from: randomSender,
    to: [{ name: account.name, email: account.email }],
    subject: randomSubject,
    body: randomBody,
    date: new Date(),
    isRead: false,
    attachments: [],
  };

  const thread: Thread = {
    id: threadId,
    subject: randomSubject,
    participants: [randomSender, { name: account.name, email: account.email }],
    messageIds: [messageId],
    folderIds: [inboxFolder.id],
    labels: [],
    isRead: false,
    isStarred: false,
    lastActivity: new Date(),
    snippet: randomBody.substring(0, 80) + '...',
  };

  addThread(thread);
  addMessage(message);
}

