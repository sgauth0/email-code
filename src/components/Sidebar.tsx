'use client';

import { Account, Folder, SyncStatus } from '@/lib/types';
import { useState } from 'react';

interface SidebarProps {
  accounts: Account[];
  selectedAccount: Account | null;
  selectedFolder: Folder | null;
  viewMode: 'all' | 'favorites' | 'account';
  onFolderSelect: (account: Account, folder: Folder) => void;
  onUnifiedInbox: () => void;
  syncStatuses: SyncStatus[];
  isFocused: boolean;
  focusIndex: number;
  onClearReauth: (accountId: string) => void;
}

export default function Sidebar({
  accounts,
  selectedAccount,
  selectedFolder,
  viewMode,
  onFolderSelect,
  syncStatuses,
  isFocused,
  focusIndex,
  onClearReauth,
}: SidebarProps) {
  const getFolderIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      inbox: 'i',
      sent: 's',
      drafts: 'd',
      archive: 'a',
      spam: '!',
      trash: 't',
      custom: 'f',
    };
    return iconMap[type] || 'f';
  };

  const getFolderShortcut = (type: string) => {
    const shortcutMap: Record<string, string> = {
      inbox: 'g i',
      sent: 'g s',
      drafts: 'g d',
      archive: 'g a',
      spam: 'g !',
      trash: 'g t',
    };
    return shortcutMap[type] || '';
  };

  // Only show folders for the selected account, or first pinned for unified views
  const displayAccount = (viewMode === 'all' || viewMode === 'favorites') 
    ? accounts.find(a => a.isPinned) || accounts[0]
    : selectedAccount;
  const syncStatus = displayAccount ? syncStatuses.find((s) => s.accountId === displayAccount.id) : null;

  return (
    <aside className="flex flex-col h-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.07] bg-black/[0.15]">
        <span className="font-mono text-[13px] tracking-wider lowercase text-white/75">folders</span>
        <div className="flex gap-2">
          {syncStatus?.isSyncing && (
            <span className="text-[12px] text-white/60 animate-spin">⟳</span>
          )}
        </div>
      </div>

      {/* Folder List */}
      <div className="flex-1 overflow-auto p-2">
        {displayAccount?.needsReauth && (
          <div className="mb-3 p-3 bg-red-500/[0.10] rounded-xl border border-red-500/[0.22]">
            <div className="text-[11px] font-mono text-red-400 mb-1.5">⚠ authentication required</div>
            <button
              onClick={() => onClearReauth(displayAccount.id)}
              className="text-[11px] font-mono text-red-400 underline hover:text-red-300"
            >
              dismiss
            </button>
          </div>
        )}

        <div className="space-y-1">
          {displayAccount?.folders.map((folder, idx) => {
            const isSelected = selectedFolder?.id === folder.id;
            const isKeyboardFocused = isFocused && focusIndex === idx;
            
            return (
              <button
                key={folder.id}
                onClick={() => onFolderSelect(displayAccount, folder)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-white/[0.06] border-white/[0.12]'
                    : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'
                } ${isKeyboardFocused ? 'ring-2 ring-cyan-500/50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-[13px] font-mono text-white/70">
                    {getFolderIcon(folder.type)}
                  </div>
                  <span className="text-[15px] text-white/85">{folder.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {folder.unreadCount > 0 && (
                    <span className="font-mono text-[12px] text-white/55 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full min-w-[28px] text-center">
                      {folder.unreadCount}
                    </span>
                  )}
                  {getFolderShortcut(folder.type) && (
                    <span className="font-mono text-[11px] text-white/40">
                      {getFolderShortcut(folder.type)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
