'use client';

import { Thread, Account } from '@/lib/types';
import { getThreadMessages } from '@/lib/dataLayer';
import { useState } from 'react';

interface ThreadDetailViewProps {
  thread: Thread | null;
  onAction: (action: string, threadId: string) => void;
  accounts: Account[];
  isFocused: boolean;
}

export default function ThreadDetailView({
  thread,
  onAction,
  accounts,
  isFocused,
}: ThreadDetailViewProps) {
  const [selectedSendingAccount, setSelectedSendingAccount] = useState<Account | null>(
    accounts[0] || null
  );
  const [showAccountWarning, setShowAccountWarning] = useState(false);

  if (!thread) {
    return (
      <main className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-y-auto flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-[13px] font-mono text-white/40 mb-2">
            select email to read
          </div>
          <div className="text-[11px] font-mono text-white/30">j/k navigate • ? help</div>
        </div>
      </main>
    );
  }

  const messages = getThreadMessages(thread.id);
  const sender = thread.participants[0];

  const getColorForSender = (name: string) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-pink-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const initials = sender.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <main className={`bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-y-auto transition-all ${
      isFocused ? 'ring-2 ring-pink-500/40' : ''
    }`}>
      <div className="p-4">
        <div className="bg-black/[0.15] backdrop-blur-sm rounded-xl p-4 border border-white/[0.06]">
          {/* Thread Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-[16px] font-mono font-bold text-white/90 flex-1">
                {thread.subject}
              </h1>
              <button
                onClick={() => onAction('star', thread.id)}
                className="ml-4 text-[14px] opacity-70 hover:opacity-100 transition-opacity"
              >
                {thread.isStarred ? '⭐' : '☆'}
              </button>
            </div>

            {/* Sender Info */}
            <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.06]">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getColorForSender(
                  sender.name
                )} flex items-center justify-center text-white font-mono font-bold text-[11px] shadow-lg`}
              >
                {initials}
              </div>
              <div className="flex-1">
                <div className="font-mono text-[13px] font-bold text-white/85">{sender.name}</div>
                <div className="font-mono text-[11px] text-white/50">{sender.email}</div>
              </div>
              <div className="text-[11px] font-mono text-white/50 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                {messages[messages.length - 1]?.date.toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06] my-4"></div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div key={message.id} className={idx > 0 ? 'border-t border-white/[0.04] pt-4' : ''}>
                <div className="prose max-w-none">
                  <p className="text-[13px] font-mono text-white/75 leading-relaxed whitespace-pre-wrap">
                    {message.body}
                  </p>
                </div>
                {message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 p-2.5 bg-white/[0.04] rounded-lg border border-white/[0.06]"
                      >
                        <span className="text-[14px]">📎</span>
                        <div className="flex-1">
                          <div className="font-mono text-[12px] text-white/80">{att.filename}</div>
                          <div className="font-mono text-[10px] text-white/40">
                            {(att.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {/* Sending Account Selector */}
            {selectedSendingAccount && (
              <div className="p-3 bg-white/[0.04] rounded-lg border border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-white/60">sending as:</span>
                  <select
                    value={selectedSendingAccount.id}
                    onChange={(e) => {
                      const account = accounts.find((a) => a.id === e.target.value);
                      setSelectedSendingAccount(account || null);
                      setShowAccountWarning(true);
                    }}
                    className="flex-1 px-2.5 py-1.5 border border-white/[0.10] rounded-lg bg-black/[0.18] text-[12px] font-mono text-white/75 focus:outline-none focus:ring-2 focus:ring-pink-500/40"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.email} ({acc.name})
                      </option>
                    ))}
                  </select>
                </div>
                {showAccountWarning && (
                  <div className="mt-2 text-[10px] font-mono text-orange-400 bg-orange-500/[0.10] p-2 rounded border border-orange-500/[0.22]">
                    ⚠ sending account changed
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {}}
                className="px-3 py-2 bg-pink-500/[0.15] text-pink-400 rounded-lg text-[12px] font-mono border border-pink-500/[0.22] hover:bg-pink-500/[0.22] transition-all"
              >
                reply
              </button>
              <button
                onClick={() => {}}
                className="px-3 py-2 bg-white/[0.04] text-white/70 rounded-lg text-[12px] font-mono border border-white/[0.08] hover:bg-white/[0.06] transition-all"
              >
                forward
              </button>
              <button
                onClick={() => onAction('archive', thread.id)}
                className="px-3 py-2 bg-emerald-500/[0.15] text-emerald-400 rounded-lg text-[12px] font-mono border border-emerald-500/[0.22] hover:bg-emerald-500/[0.22] transition-all"
              >
                archive
              </button>
              <button
                onClick={() => onAction('trash', thread.id)}
                className="px-3 py-2 bg-red-500/[0.15] text-red-400 rounded-lg text-[12px] font-mono border border-red-500/[0.22] hover:bg-red-500/[0.22] transition-all"
              >
                delete
              </button>
              <button
                onClick={() => onAction('spam', thread.id)}
                className="px-3 py-2 bg-white/[0.04] text-white/50 rounded-lg text-[12px] font-mono border border-white/[0.08] hover:bg-white/[0.06] transition-all"
              >
                spam
              </button>
              <button
                onClick={() => onAction('unread', thread.id)}
                className="px-3 py-2 bg-white/[0.04] text-white/70 rounded-lg text-[12px] font-mono border border-white/[0.08] hover:bg-white/[0.06] transition-all"
              >
                mark unread
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

