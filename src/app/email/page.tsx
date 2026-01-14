'use client';

import { useEffect, useState, useMemo } from 'react';
import { Thread, Account, Folder } from '@/lib/types';
import {
  getAccounts,
  getFolders,
  getUnifiedInbox,
  listThreads,
  getThread,
  getThreadMessages,
  markThreadRead,
  toggleThreadStar,
  archiveThread,
  trashThread,
  markAsSpam,
  moveThreadToFolder,
  getAllSyncStatuses,
  updateAccountReauthStatus,
} from '@/lib/dataLayer';
import { generateMockData } from '@/lib/mockData';
import { startSyncSimulator, stopSyncSimulator } from '@/lib/syncSimulator';
import ThreadListView from '@/components/ThreadListView';
import ThreadDetailView from '@/components/ThreadDetailView';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import HelpModal from '@/components/HelpModal';

export default function EmailPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'favorites' | 'account'>('favorites');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [focusMode, setFocusMode] = useState<'sidebar' | 'threads' | 'detail'>('threads');
  const [sidebarFocusIndex, setSidebarFocusIndex] = useState(0);
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [movePickerQuery, setMovePickerQuery] = useState('');
  const [showAccountPicker, setShowAccountPicker] = useState(false);

  // Initialize data
  useEffect(() => {
    generateMockData();
    const loadedAccounts = getAccounts();
    setAccounts(loadedAccounts);

    // Set default to favorites view, inbox folder
    const pinnedAccounts = loadedAccounts.filter(a => a.isPinned);
    if (pinnedAccounts.length > 0) {
      const firstPinned = pinnedAccounts[0];
      const inboxFolder = firstPinned.folders.find(f => f.type === 'inbox');
      if (inboxFolder) {
        setSelectedFolder(inboxFolder);
      }
    }

    // Start sync simulator
    startSyncSimulator(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 30000); // 30 seconds

    return () => {
      stopSyncSimulator();
    };
  }, []);

  // Get pinned and favorites accounts
  const pinnedAccounts = useMemo(() => accounts.filter(a => a.isPinned && !a.isSnoozed), [accounts]);
  const favoritesAccounts = useMemo(() => accounts.filter(a => a.isInFavorites && !a.isSnoozed), [accounts]);

  // Load threads based on current view
  useEffect(() => {
    if (viewMode === 'all') {
      setThreads(getUnifiedInbox());
    } else if (viewMode === 'favorites') {
      // Get unified inbox from favorites accounts only
      const favoriteAccountIds = favoritesAccounts.map(a => a.id);
      const allThreads = getUnifiedInbox();
      const favThreads = allThreads.filter(thread => 
        thread.folderIds.some(folderId => 
          favoriteAccountIds.some(accId => folderId.includes(accId))
        )
      );
      setThreads(favThreads);
    } else if (selectedFolder) {
      setThreads(listThreads(selectedFolder.id));
    } else if (selectedAccount) {
      setThreads(listThreads(undefined, selectedAccount.id));
    }
  }, [viewMode, selectedAccount, selectedFolder, refreshTrigger, favoritesAccounts]);

  // Build flat list of sidebar items for navigation
  const sidebarItems = useMemo(() => {
    const items: Array<{ type: 'unified' | 'folder'; account?: Account; folder?: Folder }> = [
      { type: 'unified' },
    ];
    accounts.forEach((account) => {
      account.folders.forEach((folder) => {
        items.push({ type: 'folder', account, folder });
      });
    });
    return items;
  }, [accounts]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input (except for move picker)
      if ((e.target as HTMLElement).tagName === 'INPUT' && !showMovePicker) return;
      
      // Close move picker with Escape
      if (showMovePicker && e.key === 'Escape') {
        e.preventDefault();
        setShowMovePicker(false);
        setMovePickerQuery('');
        return;
      }

      // Tab: Cycle through focus zones (folders → threads → detail)
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: backwards
          setFocusMode((prev) => {
            if (prev === 'sidebar') return selectedThread ? 'detail' : 'threads';
            if (prev === 'threads') return 'sidebar';
            return 'threads';
          });
        } else {
          // Tab: forwards
          setFocusMode((prev) => {
            if (prev === 'sidebar') return 'threads';
            if (prev === 'threads') return selectedThread ? 'detail' : 'sidebar';
            return 'sidebar';
          });
        }
        return;
      }

      // Account switching: [ and ] (cycle through pinned accounts only)
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const direction = e.key === ']' ? 1 : -1;
        
        if (viewMode === 'account' && selectedAccount) {
          const currentIdx = pinnedAccounts.findIndex(a => a.id === selectedAccount.id);
          const newIdx = (currentIdx + direction + pinnedAccounts.length) % pinnedAccounts.length;
          const newAccount = pinnedAccounts[newIdx];
          setViewMode('account');
          setSelectedAccount(newAccount);
          setSelectedFolder(newAccount.folders.find(f => f.type === 'inbox') || newAccount.folders[0]);
        } else if (pinnedAccounts.length > 0) {
          // Start cycling from first pinned
          const firstAccount = direction > 0 ? pinnedAccounts[0] : pinnedAccounts[pinnedAccounts.length - 1];
          setViewMode('account');
          setSelectedAccount(firstAccount);
          setSelectedFolder(firstAccount.folders.find(f => f.type === 'inbox') || firstAccount.folders[0]);
        }
        setSelectedThread(null);
        return;
      }

      // Direct account access: 0 = all, 9 = favorites, 1-8 = pinned accounts
      if (e.key >= '0' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const num = parseInt(e.key);
        if (num === 0) {
          // All accounts unified
          setViewMode('all');
          setSelectedAccount(null);
          setSelectedFolder(null);
        } else if (num === 9) {
          // Favorites unified
          setViewMode('favorites');
          setSelectedAccount(null);
          setSelectedFolder(null);
        } else if (num <= pinnedAccounts.length) {
          // Specific pinned account
          const account = pinnedAccounts[num - 1];
          setViewMode('account');
          setSelectedAccount(account);
          setSelectedFolder(account.folders.find(f => f.type === 'inbox') || account.folders[0]);
        }
        setSelectedThread(null);
        return;
      }

      // Open account picker: g g
      if (e.key === 'g') {
        // Simple detection: if last key was also 'g' within 500ms
        const now = Date.now();
        const lastG = (window as any).__lastGPress || 0;
        if (now - lastG < 500) {
          e.preventDefault();
          setShowAccountPicker(true);
          (window as any).__lastGPress = 0;
        } else {
          (window as any).__lastGPress = now;
        }
        return;
      }

      // j/k navigation (context-aware)
      if (e.key === 'j' || e.key === 'k') {
        e.preventDefault();
        
        if (focusMode === 'sidebar') {
          // Navigate folders
          const direction = e.key === 'k' ? 1 : -1;
          const currentAccount = (viewMode === 'all' || viewMode === 'favorites') ? accounts.find(a => a.isPinned) || accounts[0] : selectedAccount;
          if (currentAccount) {
            const folders = currentAccount.folders;
            const currentIdx = selectedFolder ? folders.findIndex(f => f.id === selectedFolder.id) : -1;
            const newIdx = currentIdx + direction;
            if (newIdx >= 0 && newIdx < folders.length) {
              setSelectedFolder(folders[newIdx]);
              setSelectedThread(null);
            }
          }
        } else if (focusMode === 'threads') {
          // Navigate thread list
          const direction = e.key === 'k' ? 1 : -1;
          if (selectedThread) {
            const currentIdx = threads.findIndex(t => t.id === selectedThread.id);
            const newIdx = currentIdx + direction;
            if (newIdx >= 0 && newIdx < threads.length) {
              const newThread = threads[newIdx];
              setSelectedThread(newThread);
              if (!newThread.isRead) {
                markThreadRead(newThread.id, true);
                setRefreshTrigger((prev) => prev + 1);
              }
            }
          } else if (threads.length > 0) {
            const thread = threads[0];
            setSelectedThread(thread);
            if (!thread.isRead) {
              markThreadRead(thread.id, true);
              setRefreshTrigger((prev) => prev + 1);
            }
          }
        }
        return;
      }

      // Folder shortcuts when in sidebar focus
      if (focusMode === 'sidebar') {
        const currentAccount = (viewMode === 'all' || viewMode === 'favorites') ? accounts.find(a => a.isPinned) || accounts[0] : selectedAccount;
        if (currentAccount) {
          let targetFolder: Folder | undefined;
          switch (e.key) {
            case 'i':
              targetFolder = currentAccount.folders.find(f => f.type === 'inbox');
              break;
            case 'a':
              targetFolder = currentAccount.folders.find(f => f.type === 'archive');
              break;
            case 'd':
              targetFolder = currentAccount.folders.find(f => f.type === 'drafts');
              break;
            case 't':
              targetFolder = currentAccount.folders.find(f => f.type === 'trash');
              break;
          }
          if (targetFolder) {
            e.preventDefault();
            setSelectedFolder(targetFolder);
            setSelectedThread(null);
            return;
          }
        }
      }

      // Enter: context-aware action
      if (e.key === 'Enter') {
        e.preventDefault();
        if (focusMode === 'threads' && selectedThread) {
          // Open thread detail
          setFocusMode('detail');
        } else if (focusMode === 'detail' && selectedThread) {
          // Archive and next
          archiveThread(selectedThread.id);
          const currentIdx = threads.findIndex(t => t.id === selectedThread.id);
          if (currentIdx < threads.length - 1) {
            const nextThread = threads[currentIdx + 1];
            setSelectedThread(nextThread);
            if (!nextThread.isRead) {
              markThreadRead(nextThread.id, true);
            }
          } else {
            setSelectedThread(null);
          }
          setRefreshTrigger((prev) => prev + 1);
        }
        return;
      }

      // Thread list actions (when thread selected)
      if (selectedThread) {
        switch (e.key) {
          case ' ':
            // Space: toggle read/unread
            e.preventDefault();
            markThreadRead(selectedThread.id, !selectedThread.isRead);
            setRefreshTrigger((prev) => prev + 1);
            break;
          case 'e':
            // Archive
            e.preventDefault();
            archiveThread(selectedThread.id);
            setRefreshTrigger((prev) => prev + 1);
            const archiveIdx = threads.findIndex(t => t.id === selectedThread.id);
            if (archiveIdx < threads.length - 1) {
              setSelectedThread(threads[archiveIdx + 1]);
            } else if (archiveIdx > 0) {
              setSelectedThread(threads[archiveIdx - 1]);
            } else {
              setSelectedThread(null);
            }
            break;
          case 'd':
            // Delete
            e.preventDefault();
            trashThread(selectedThread.id);
            const deleteIdx = threads.findIndex(t => t.id === selectedThread.id);
            if (deleteIdx < threads.length - 1) {
              setSelectedThread(threads[deleteIdx + 1]);
            } else if (deleteIdx > 0) {
              setSelectedThread(threads[deleteIdx - 1]);
            } else {
              setSelectedThread(null);
            }
            setRefreshTrigger((prev) => prev + 1);
            break;
          case 'm':
            // Move to folder
            e.preventDefault();
            setShowMovePicker(true);
            setMovePickerQuery('');
            break;
          case 's':
            // Star
            e.preventDefault();
            toggleThreadStar(selectedThread.id);
            setRefreshTrigger((prev) => prev + 1);
            break;
        }
      }

      // Global shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowHelp(true);
      } else if (e.key === 'Escape') {
        if (showAccountPicker) {
          setShowAccountPicker(false);
        } else if (showHelp) {
          setShowHelp(false);
        } else if (selectedThread && focusMode === 'detail') {
          setFocusMode('threads');
        } else {
          setSelectedThread(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedThread, threads, showHelp, focusMode, selectedAccount, selectedFolder, viewMode, accounts, showMovePicker, pinnedAccounts, showAccountPicker]);

  const handleThreadClick = (thread: Thread) => {
    setSelectedThread(thread);
    if (!thread.isRead) {
      markThreadRead(thread.id, true);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleThreadAction = (action: string, threadId: string) => {
    switch (action) {
      case 'archive':
        archiveThread(threadId);
        break;
      case 'trash':
        trashThread(threadId);
        setSelectedThread(null);
        break;
      case 'spam':
        markAsSpam(threadId);
        setSelectedThread(null);
        break;
      case 'star':
        toggleThreadStar(threadId);
        break;
      case 'unread':
        markThreadRead(threadId, false);
        break;
    }
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleFolderSelect = (account: Account, folder: Folder) => {
    setSelectedAccount(account);
    setSelectedFolder(folder);
    setViewMode('account');
    setSelectedThread(null);
  };

  const handleAllInbox = () => {
    setViewMode('all');
    setSelectedAccount(null);
    setSelectedFolder(null);
    setSelectedThread(null);
  };

  const handleFavoritesInbox = () => {
    setViewMode('favorites');
    setSelectedAccount(null);
    setSelectedFolder(null);
    setSelectedThread(null);
  };

  const toggleAccountPin = (accountId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, isPinned: !acc.isPinned } : acc
    ));
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleAccountFavorite = (accountId: string) => {
    setAccounts(prev => prev.map(acc => 
      acc.id === accountId ? { ...acc, isInFavorites: !acc.isInFavorites } : acc
    ));
    setRefreshTrigger(prev => prev + 1);
  };

  const syncStatuses = getAllSyncStatuses();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Radial gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[12%] w-[1200px] h-[700px] bg-cyan-500/[0.07] rounded-full blur-3xl"></div>
        <div className="absolute top-[10%] right-[12%] w-[1000px] h-[600px] bg-fuchsia-500/[0.06] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[70%] w-[900px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-3xl"></div>
      </div>

      <div className="relative grid grid-rows-[56px_1fr] gap-3 p-3.5 h-full">
        {/* Top Bar with Account Pills */}
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-3 min-w-[260px]">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_18px_rgba(0,255,255,0.25)]"></div>
            <span className="font-mono text-[13px] tracking-wide text-white/80">stella-mail</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* All (unified) */}
            <button
              onClick={handleAllInbox}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[12px] font-mono transition-all hover:-translate-y-px ${
                viewMode === 'all'
                  ? 'border-white/[0.22] bg-white/[0.06]'
                  : 'border-white/[0.10] bg-black/[0.18] hover:border-white/[0.16]'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white/30"></div>
              <span className="text-white/85">all</span>
            </button>

            {/* Favorites (unified pinned only) */}
            <button
              onClick={handleFavoritesInbox}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[12px] font-mono transition-all hover:-translate-y-px ${
                viewMode === 'favorites'
                  ? 'border-white/[0.22] bg-white/[0.06]'
                  : 'border-white/[0.10] bg-black/[0.18] hover:border-white/[0.16]'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-[0_0_16px_rgba(255,200,0,0.15)]"></div>
              <span className="text-white/85">fav</span>
            </button>
            
            {/* Pinned accounts */}
            {pinnedAccounts.map((account, idx) => {
              const healthColor = account.healthStatus === 'good' ? 'bg-emerald-500' : account.healthStatus === 'reauth' ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <button
                  key={account.id}
                  onClick={() => {
                    setSelectedAccount(account);
                    setViewMode('account');
                    setSelectedFolder(account.folders.find(f => f.type === 'inbox') || account.folders[0]);
                    setSelectedThread(null);
                  }}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-[12px] font-mono transition-all hover:-translate-y-px ${
                    selectedAccount?.id === account.id && viewMode === 'account'
                      ? 'border-white/[0.22] bg-white/[0.06]'
                      : 'border-white/[0.10] bg-black/[0.18] hover:border-white/[0.16]'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${healthColor} shadow-[0_0_16px_rgba(255,255,255,0.10)]`}></div>
                  <span className="text-white/85">{account.name.split(' ')[0].toLowerCase()}</span>
                </button>
              );
            })}

            {/* More... picker */}
            <button
              onClick={() => setShowAccountPicker(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-dashed border-white/[0.10] bg-black/[0.12] text-[12px] font-mono text-white/60 hover:border-white/[0.16] hover:text-white/80 transition-all"
            >
              <span>more...</span>
            </button>
            
            <button 
              onClick={() => setShowHelp(true)}
              className="px-2.5 py-1.5 rounded-full border border-dashed border-white/[0.10] bg-white/[0.04] text-[12px] font-mono text-white/70 hover:border-white/[0.16] transition-all"
            >
              ?
            </button>
          </div>
        </div>

        {/* Main 3-column layout */}
        <div className="grid grid-cols-[290px_1fr_520px] gap-3 min-h-0">
          <Sidebar
            accounts={accounts}
            selectedAccount={selectedAccount}
            selectedFolder={selectedFolder}
            viewMode={viewMode}
            onFolderSelect={handleFolderSelect}
            onUnifiedInbox={handleAllInbox}
            syncStatuses={syncStatuses}
            isFocused={focusMode === 'sidebar'}
            focusIndex={sidebarFocusIndex}
            onClearReauth={(accountId: string) => {
              updateAccountReauthStatus(accountId, false);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />

          <ThreadListView
            threads={threads}
            selectedThread={selectedThread}
            onThreadClick={handleThreadClick}
            viewMode={viewMode}
            searchQuery={searchQuery}
            isFocused={focusMode === 'threads'}
          />

          <ThreadDetailView
            thread={selectedThread}
            onAction={handleThreadAction}
            accounts={accounts}
            isFocused={focusMode === 'detail'}
          />
        </div>
      </div>

      {/* Move to Folder Picker */}
      {showMovePicker && selectedThread && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-[480px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.08]">
              <input
                type="text"
                value={movePickerQuery}
                onChange={(e) => setMovePickerQuery(e.target.value)}
                placeholder="Move to folder..."
                autoFocus
                className="w-full bg-transparent border-none outline-none text-[14px] font-mono text-white/90 placeholder-white/40"
              />
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {accounts.flatMap(account =>
                account.folders
                  .filter(folder => 
                    folder.name.toLowerCase().includes(movePickerQuery.toLowerCase()) ||
                    folder.type?.toLowerCase().includes(movePickerQuery.toLowerCase())
                  )
                  .map(folder => (
                    <button
                      key={`${account.id}-${folder.id}`}
                      onClick={() => {
                        // Move thread logic here
                        setShowMovePicker(false);
                        setMovePickerQuery('');
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-white/[0.06] transition-colors text-left border-b border-white/[0.04]"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <span className="text-[13px] font-mono text-white/70">
                          {folder.type === 'inbox' ? 'i' : folder.type === 'sent' ? 's' : folder.type === 'drafts' ? 'd' : folder.type === 'archive' ? 'a' : folder.type === 'spam' ? '!' : folder.type === 'trash' ? 't' : 'f'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-mono text-white/85">{folder.name}</div>
                        <div className="text-[11px] font-mono text-white/40">{account.email}</div>
                      </div>
                    </button>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Picker (More...) */}
      {showAccountPicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-[560px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between">
              <span className="text-[13px] font-mono text-white/75">all accounts</span>
              <button
                onClick={() => setShowAccountPicker(false)}
                className="text-[12px] font-mono text-white/50 hover:text-white/80 transition-colors"
              >
                esc
              </button>
            </div>
            <div className="max-h-[480px] overflow-y-auto p-2">
              {accounts.map((account) => {
                const healthColor = account.healthStatus === 'good' ? 'bg-emerald-500' : account.healthStatus === 'reauth' ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div
                    key={account.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors border-b border-white/[0.04]"
                  >
                    <div className={`w-3 h-3 rounded-full ${healthColor} flex-shrink-0`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-mono text-white/85 font-bold">{account.name}</div>
                      <div className="text-[11px] font-mono text-white/50">{account.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleAccountPin(account.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                          account.isPinned
                            ? 'bg-cyan-500/[0.15] text-cyan-400 border-cyan-500/[0.22]'
                            : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:border-white/[0.12]'
                        }`}
                        title="p: toggle pin"
                      >
                        {account.isPinned ? 'pinned' : 'pin'}
                      </button>
                      <button
                        onClick={() => toggleAccountFavorite(account.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                          account.isInFavorites
                            ? 'bg-yellow-500/[0.15] text-yellow-400 border-yellow-500/[0.22]'
                            : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:border-white/[0.12]'
                        }`}
                        title="f: toggle favorite"
                      >
                        {account.isInFavorites ? 'fav' : 'add'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setViewMode('account');
                          setSelectedFolder(account.folders.find(f => f.type === 'inbox') || account.folders[0]);
                          setSelectedThread(null);
                          setShowAccountPicker(false);
                        }}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono bg-white/[0.06] text-white/75 border border-white/[0.10] hover:bg-white/[0.08] transition-all"
                      >
                        show
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
