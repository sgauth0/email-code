'use client';

import { Thread } from '@/lib/types';

interface ThreadListViewProps {
  threads: Thread[];
  selectedThread: Thread | null;
  onThreadClick: (thread: Thread) => void;
  viewMode: 'unified' | 'account';
  searchQuery: string;
  isFocused: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
  showAvatars: boolean;
}

export default function ThreadListView({
  threads,
  selectedThread,
  onThreadClick,
  viewMode,
  searchQuery,
  isFocused,
  density,
  showAvatars,
}: ThreadListViewProps) {
  const filteredThreads = searchQuery
    ? threads.filter(
        (t) =>
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.participants.some((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : threads;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else if (hours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getColorForSender = (name: string) => {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-blue-400 to-cyan-400',
      'from-green-400 to-emerald-400',
      'from-yellow-400 to-orange-400',
      'from-red-400 to-pink-400',
      'from-indigo-400 to-purple-400',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className={`bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] overflow-hidden flex flex-col transition-all ${
      isFocused ? 'ring-2 ring-cyan-500/40' : ''
    }`}>
      <div className="px-3 py-3 border-b border-white/[0.07] bg-black/[0.15]">
        <div className="relative">
          <input
            type="search"
            placeholder="search..."
            className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent text-[13px] font-mono text-white/85 placeholder-white/40 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length > 0 ? (
          filteredThreads.map((thread) => {
            const sender = thread.participants[0];
            const initials = sender.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            const paddingClass = density === 'compact' ? 'p-2' : density === 'spacious' ? 'p-4' : 'p-3';
            const avatarSize = density === 'compact' ? 'w-8 h-8' : density === 'spacious' ? 'w-10 h-10' : 'w-9 h-9';
            const textSize = density === 'compact' ? 'text-[12px]' : density === 'spacious' ? 'text-[14px]' : 'text-[13px]';
            const gapSize = density === 'compact' ? 'gap-2' : density === 'spacious' ? 'gap-4' : 'gap-3';

            return (
              <div
                key={thread.id}
                onClick={() => onThreadClick(thread)}
                className={`${paddingClass} cursor-pointer transition-all border-b border-white/[0.04] ${
                  selectedThread?.id === thread.id 
                    ? 'bg-white/[0.06] border-l-2 border-l-cyan-500' 
                    : 'hover:bg-white/[0.03]'
                } ${!thread.isRead ? 'border-l-2 border-l-fuchsia-500' : ''}`}
              >
                <div className={`flex ${gapSize}`}>
                  {showAvatars && (
                    <div
                      className={`${avatarSize} rounded-xl bg-gradient-to-br ${getColorForSender(
                        sender.name
                      )} flex items-center justify-center text-white font-mono font-bold text-[11px] shadow-md flex-shrink-0`}
                    >
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`truncate ${textSize} font-mono ${
                          !thread.isRead
                            ? 'font-bold text-white/90'
                            : 'text-white/75'
                        }`}
                      >
                        {sender.name}
                      </span>
                      <span className={`${density === 'compact' ? 'text-[10px]' : 'text-[11px]'} font-mono text-white/50 ml-2 flex-shrink-0`}>
                        {formatDate(thread.lastActivity)}
                      </span>
                    </div>
                    <div
                      className={`${textSize} font-mono mb-1 truncate ${
                        !thread.isRead ? 'font-bold text-white/85' : 'text-white/70'
                      }`}
                    >
                      {thread.subject}
                    </div>
                    <div className={`${density === 'compact' ? 'text-[11px]' : 'text-[12px]'} font-mono text-white/50 truncate`}>{thread.snippet}</div>
                    <div className="flex gap-2 mt-2">
                      {thread.isStarred && <span className="text-[12px]">⭐</span>}
                      {thread.labels.map((label) => (
                        <span
                          key={label}
                          className="text-[11px] font-mono bg-white/[0.06] text-white/70 border border-white/[0.08] px-2 py-0.5 rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center">
            <div className="text-[13px] font-mono text-white/40">
              {searchQuery ? 'no results' : 'no emails'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
