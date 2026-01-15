'use client';

import { useState, useEffect } from 'react';
import { Account, Thread } from '@/lib/types';

interface ComposeModalProps {
  onClose: () => void;
  onSend: (data: {
    from: string;
    to: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
  }) => void;
  accounts: Account[];
  replyTo?: Thread;
  defaultAccount?: Account;
}

export default function ComposeModal({
  onClose,
  onSend,
  accounts,
  replyTo,
  defaultAccount,
}: ComposeModalProps) {
  const [fromAccount, setFromAccount] = useState<Account>(
    defaultAccount || accounts.find(a => a.isPinned) || accounts[0]
  );
  const [to, setTo] = useState(replyTo ? replyTo.participants[0].email : '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  // Keyboard shortcuts for compose modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab: cycle through FROM -> TO -> SUBJECT -> BODY
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const fromSelect = document.getElementById('compose-from-select') as HTMLSelectElement;
        const toInput = document.getElementById('compose-to-input') as HTMLInputElement;
        const subjectInput = document.getElementById('compose-subject-input') as HTMLInputElement;
        const bodyTextarea = document.getElementById('compose-body-textarea') as HTMLTextAreaElement;
        
        const activeElement = document.activeElement;
        
        if (activeElement === fromSelect) {
          toInput?.focus();
        } else if (activeElement === toInput) {
          subjectInput?.focus();
        } else if (activeElement === subjectInput) {
          bodyTextarea?.focus();
        } else if (activeElement === bodyTextarea) {
          fromSelect?.focus();
        } else {
          // Start from beginning if nothing focused
          fromSelect?.focus();
        }
      }
      
      // Shift+Tab: cycle backwards
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        const fromSelect = document.getElementById('compose-from-select') as HTMLSelectElement;
        const toInput = document.getElementById('compose-to-input') as HTMLInputElement;
        const subjectInput = document.getElementById('compose-subject-input') as HTMLInputElement;
        const bodyTextarea = document.getElementById('compose-body-textarea') as HTMLTextAreaElement;
        
        const activeElement = document.activeElement;
        
        if (activeElement === fromSelect) {
          bodyTextarea?.focus();
        } else if (activeElement === toInput) {
          fromSelect?.focus();
        } else if (activeElement === subjectInput) {
          toInput?.focus();
        } else if (activeElement === bodyTextarea) {
          subjectInput?.focus();
        } else {
          // Start from end if nothing focused
          bodyTextarea?.focus();
        }
      }
      
      // Cmd/Ctrl+Enter to send
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (to && subject && body) {
          handleSend();
        }
      }
      
      // Cmd/Ctrl+Shift+F to focus from account dropdown
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        const fromSelect = document.getElementById('compose-from-select') as HTMLSelectElement;
        if (fromSelect) fromSelect.focus();
      }

      // Cmd/Ctrl+Shift+A to cycle through from accounts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        const currentIndex = accounts.findIndex(a => a.id === fromAccount.id);
        const nextIndex = (currentIndex + 1) % accounts.length;
        setFromAccount(accounts[nextIndex]);
      }

      // Escape to close
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [to, subject, body, fromAccount, accounts, onClose]);

  const handleSend = () => {
    if (!to || !subject || !body) {
      return; // Basic validation
    }
    onSend({
      from: fromAccount.email,
      to,
      cc,
      bcc,
      subject,
      body,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-[900px] max-h-[90vh] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-pink-400 to-fuchsia-500 shadow-[0_0_18px_rgba(255,105,180,0.25)]"></div>
            <div>
              <h2 className="text-[16px] font-mono font-bold text-white/90">
                {replyTo ? 'reply' : 'compose'}
              </h2>
              <p className="text-[10px] font-mono text-white/40">⌘⇧A: cycle from · ⌘↵: send · esc: close</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={!to || !subject || !body}
              className="px-4 py-2 bg-pink-500/[0.20] border border-pink-500/[0.30] rounded-xl text-[13px] font-mono text-pink-300 hover:bg-pink-500/[0.30] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              send
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-white/[0.06] transition-all text-[18px]"
            >
              ×
            </button>
          </div>
        </div>

        {/* From Account - VERY PROMINENT */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500/[0.12] to-fuchsia-500/[0.12] border-b border-white/[0.08] flex-shrink-0">
          <div className="text-[11px] font-mono text-white/60 uppercase tracking-wider mb-2">
            sending from
          </div>
          <div className="relative">
            <select
              id="compose-from-select"
              value={fromAccount.id}
              onChange={(e) => {
                const account = accounts.find((a) => a.id === e.target.value);
                if (account) setFromAccount(account);
              }}
              className="w-full px-4 py-3 bg-white/[0.08] border-2 border-pink-500/[0.40] rounded-xl text-[15px] font-mono font-bold text-white/95 appearance-none cursor-pointer hover:bg-white/[0.10] transition-all focus:outline-none focus:ring-2 focus:ring-pink-500/60"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '20px',
              }}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.email})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* To */}
          <div className="flex items-start gap-3">
            <label className="text-[12px] font-mono text-white/60 uppercase tracking-wider w-12 pt-2.5">
              to
            </label>
            <input
              id="compose-to-input"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-[13px] font-mono text-white/90 placeholder-white/40"
            />
            {!showCc && !showBcc && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCc(true)}
                  className="px-2 py-2 text-[11px] font-mono text-white/50 hover:text-white/80 transition-all"
                >
                  cc
                </button>
                <button
                  onClick={() => setShowBcc(true)}
                  className="px-2 py-2 text-[11px] font-mono text-white/50 hover:text-white/80 transition-all"
                >
                  bcc
                </button>
              </div>
            )}
          </div>

          {/* Cc */}
          {showCc && (
            <div className="flex items-start gap-3">
              <label className="text-[12px] font-mono text-white/60 uppercase tracking-wider w-12 pt-2.5">
                cc
              </label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="carbon copy"
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-[13px] font-mono text-white/90 placeholder-white/40"
              />
              <button
                onClick={() => {
                  setShowCc(false);
                  setCc('');
                }}
                className="px-2 py-2 text-[11px] font-mono text-white/50 hover:text-white/80"
              >
                ×
              </button>
            </div>
          )}

          {/* Bcc */}
          {showBcc && (
            <div className="flex items-start gap-3">
              <label className="text-[12px] font-mono text-white/60 uppercase tracking-wider w-12 pt-2.5">
                bcc
              </label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                placeholder="blind carbon copy"
                className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-[13px] font-mono text-white/90 placeholder-white/40"
              />
              <button
                onClick={() => {
                  setShowBcc(false);
                  setBcc('');
                }}
                className="px-2 py-2 text-[11px] font-mono text-white/50 hover:text-white/80"
              >
                ×
              </button>
            </div>
          )}

          {/* Subject */}
          <div className="flex items-start gap-3">
            <label className="text-[12px] font-mono text-white/60 uppercase tracking-wider w-12 pt-2.5">
              subject
            </label>
            <input
              id="compose-subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-[13px] font-mono text-white/90 placeholder-white/40"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08] my-4"></div>

          {/* Body */}
          <div>
            <textarea
              id="compose-body-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="w-full h-[320px] px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-transparent text-[13px] font-mono text-white/90 placeholder-white/40 resize-none leading-relaxed"
            />
          </div>

          {/* Footer Toolbar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/60 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                📎 attach
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-white/60 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                🔗 insert link
              </button>
            </div>
            <div className="text-[11px] font-mono text-white/40">
              {body.length} characters
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

