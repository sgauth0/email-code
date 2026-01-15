// Mock data generator with realistic sample data

import {
  Account,
  Folder,
  Thread,
  Message,
  Participant,
  Attachment,
} from './types';
import { initializeStore } from './dataLayer';

const colorGradients = [
  'from-purple-400 to-pink-400',
  'from-blue-400 to-pink-400',
  'from-green-400 to-emerald-400',
  'from-yellow-400 to-orange-400',
  'from-red-400 to-pink-400',
  'from-indigo-400 to-purple-400',
];

// Realistic sender names and emails
const mockSenders: Participant[] = [
  { name: 'Sarah Chen', email: 'sarah.chen@techcorp.com' },
  { name: 'Marcus Johnson', email: 'marcus@designstudio.io' },
  { name: 'Emma Rodriguez', email: 'emma.r@startup.com' },
  { name: 'James Wilson', email: 'jwilson@marketing.co' },
  { name: 'Priya Patel', email: 'priya@cloudservices.com' },
  { name: 'Alex Kim', email: 'alex.kim@freelance.dev' },
  { name: 'LinkedIn', email: 'notifications@linkedin.com' },
  { name: 'GitHub', email: 'noreply@github.com' },
  { name: 'Slack', email: 'feedback@slack.com' },
  { name: 'Netflix', email: 'info@netflix.com' },
];

let threadIdCounter = 1;
let messageIdCounter = 1;

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateMockData(): void {
  const accounts: Account[] = [
    {
      id: 'acc_1',
      email: 'you@personal.com',
      name: 'Personal Account',
      provider: 'gmail',
      color: colorGradients[0],
      folders: [],
      isPinned: true,
      isInFavorites: true,
      healthStatus: 'good',
    },
    {
      id: 'acc_2',
      email: 'you@work.com',
      name: 'Work Account',
      provider: 'outlook',
      color: colorGradients[1],
      folders: [],
      isPinned: true,
      isInFavorites: true,
      healthStatus: 'good',
    },
  ];

  const folders: Folder[] = [];

  // Create standard folders for each account
  accounts.forEach((account, idx) => {
    const accountFolders: Folder[] = [
      {
        id: `folder_${account.id}_inbox`,
        accountId: account.id,
        name: 'Inbox',
        path: 'INBOX',
        type: 'inbox',
        unreadCount: 0,
        threadIds: [],
      },
      {
        id: `folder_${account.id}_sent`,
        accountId: account.id,
        name: 'Sent',
        path: 'SENT',
        type: 'sent',
        unreadCount: 0,
        threadIds: [],
      },
      {
        id: `folder_${account.id}_drafts`,
        accountId: account.id,
        name: 'Drafts',
        path: 'DRAFTS',
        type: 'drafts',
        unreadCount: 0,
        threadIds: [],
      },
      {
        id: `folder_${account.id}_archive`,
        accountId: account.id,
        name: 'Archive',
        path: 'ARCHIVE',
        type: 'archive',
        unreadCount: 0,
        threadIds: [],
      },
      {
        id: `folder_${account.id}_spam`,
        accountId: account.id,
        name: 'Spam',
        path: 'SPAM',
        type: 'spam',
        unreadCount: 0,
        threadIds: [],
      },
      {
        id: `folder_${account.id}_trash`,
        accountId: account.id,
        name: 'Trash',
        path: 'TRASH',
        type: 'trash',
        unreadCount: 0,
        threadIds: [],
      },
    ];

    // Add custom folders for work account
    if (idx === 1) {
      accountFolders.push(
        {
          id: `folder_${account.id}_projects`,
          accountId: account.id,
          name: 'Projects',
          path: 'Projects',
          type: 'custom',
          unreadCount: 0,
          threadIds: [],
        },
        {
          id: `folder_${account.id}_clients`,
          accountId: account.id,
          name: 'Clients',
          path: 'Clients',
          type: 'custom',
          unreadCount: 0,
          threadIds: [],
        }
      );
    }

    account.folders = accountFolders;
    folders.push(...accountFolders);
  });

  const threads: Thread[] = [];
  const messages: Message[] = [];

  // Generate threads with messages
  const threadTemplates = [
    {
      subject: '✨ Weekend Coffee Plans',
      sender: mockSenders[0],
      snippet: 'Hey! Want to try that new cafe downtown this Saturday? I heard they have amazing...',
      body: 'Hey! Want to try that new cafe downtown this Saturday? I heard they have amazing matcha lattes and the vibe is super cozy. Let me know if you are free around 11am! 🍵',
      accountIds: ['acc_1'],
      isUnread: true,
      hasAttachment: false,
    },
    {
      subject: 'Project Deadline Update',
      sender: mockSenders[1],
      snippet: 'Quick update on the design sprint - we need to push the final review to next...',
      body: "Quick update on the design sprint - we need to push the final review to next Wednesday. The client requested some additional changes to the homepage mockups. Can you have the revisions ready by Tuesday EOD?",
      accountIds: ['acc_2'],
      isUnread: true,
      hasAttachment: false,
    },
    {
      subject: 'Re: Q4 Budget Proposal',
      sender: mockSenders[3],
      snippet: 'Thanks for sending over the proposal. I reviewed it with the team and we have...',
      body: "Thanks for sending over the proposal. I reviewed it with the team and we have a few questions about the marketing spend allocation. Can we schedule a call this week to discuss?",
      accountIds: ['acc_2'],
      isUnread: false,
      hasAttachment: true,
    },
    {
      subject: 'Netflix: New shows you might like',
      sender: mockSenders[9],
      snippet: 'Based on your viewing history, we think you will love these new releases...',
      body: 'Based on your viewing history, we think you will love these new releases coming this month. Check out our recommendations!',
      accountIds: ['acc_1'],
      isUnread: false,
      hasAttachment: false,
    },
    {
      subject: 'GitHub: Pull request merged',
      sender: mockSenders[7],
      snippet: 'Your pull request #234 has been merged into main branch...',
      body: "Your pull request #234 'Add email client features' has been merged into main branch by @reviewer. Great work!",
      accountIds: ['acc_1', 'acc_2'], // Overlapping sender
      isUnread: true,
      hasAttachment: false,
    },
    {
      subject: 'Client Meeting Notes - TechCorp',
      sender: mockSenders[2],
      snippet: 'Here are the notes from the client meeting with TechCorp. Key takeaways...',
      body: 'Here are the notes from the client meeting with TechCorp. Key takeaways: 1) They want to launch by end of Q1, 2) Budget approved for additional features, 3) Need weekly status updates. Action items attached.',
      accountIds: ['acc_2'],
      isUnread: true,
      hasAttachment: true,
    },
    {
      subject: 'Lunch tomorrow?',
      sender: mockSenders[5],
      snippet: 'Hey! Are you free for lunch tomorrow around 12:30? There is a new ramen place...',
      body: 'Hey! Are you free for lunch tomorrow around 12:30? There is a new ramen place that opened near the office and I have been wanting to try it. Let me know!',
      accountIds: ['acc_1'],
      isUnread: false,
      hasAttachment: false,
    },
    {
      subject: 'LinkedIn: You appeared in 45 searches this week',
      sender: mockSenders[6],
      snippet: 'Your profile is getting attention! You appeared in 45 searches this week...',
      body: "Your profile is getting attention! You appeared in 45 searches this week. Update your profile to increase visibility.",
      accountIds: ['acc_1', 'acc_2'],
      isUnread: false,
      hasAttachment: false,
    },
  ];

  threadTemplates.forEach((template, idx) => {
    template.accountIds.forEach((accountId: string) => {
      const threadId = `thread_${threadIdCounter++}`;
      const inboxFolder = folders.find(
        (f) => f.accountId === accountId && f.type === 'inbox'
      );

      if (!inboxFolder) return;

      const messageId = `msg_${messageIdCounter++}`;
      const now = new Date();
      const messageDate = new Date(now.getTime() - (idx * 3600000)); // Spread messages over time

      const message: Message = {
        id: messageId,
        threadId,
        from: template.sender,
        to: [
          {
            name: accounts.find((a) => a.id === accountId)?.name || 'You',
            email: accounts.find((a) => a.id === accountId)?.email || 'you@example.com',
          },
        ],
        subject: template.subject,
        body: template.body,
        date: messageDate,
        isRead: !template.isUnread,
        attachments: template.hasAttachment
          ? [
              {
                id: `att_${Date.now()}`,
                filename: 'meeting-notes.pdf',
                mimeType: 'application/pdf',
                size: 245678,
              },
            ]
          : [],
      };

      const thread: Thread = {
        id: threadId,
        subject: template.subject,
        participants: [template.sender, message.to[0]],
        messageIds: [messageId],
        folderIds: [inboxFolder.id],
        labels: [],
        isRead: !template.isUnread,
        isStarred: idx === 0 || idx === 4, // Star first and fifth thread
        lastActivity: messageDate,
        snippet: template.snippet,
      };

      threads.push(thread);
      messages.push(message);
    });
  });

  // Initialize the store
  initializeStore({ accounts, folders, threads, messages });
}

