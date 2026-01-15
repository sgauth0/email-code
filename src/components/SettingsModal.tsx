'use client';

import { useState } from 'react';
import { Account } from '@/lib/types';

interface SettingsModalProps {
  onClose: () => void;
  accounts: Account[];
  onAddAccount: () => void;
  backgroundTheme: 'aurora' | 'sunset' | 'ocean' | 'forest' | 'midnight' | 'neon';
  onBackgroundThemeChange: (theme: 'aurora' | 'sunset' | 'ocean' | 'forest' | 'midnight' | 'neon') => void;
  density: 'compact' | 'comfortable' | 'spacious';
  onDensityChange: (density: 'compact' | 'comfortable' | 'spacious') => void;
  showAvatars: boolean;
  onShowAvatarsChange: (show: boolean) => void;
  enableSounds: boolean;
  onEnableSoundsChange: (enable: boolean) => void;
  desktopNotifications: boolean;
  onDesktopNotificationsChange: (enable: boolean) => void;
  badgeCount: boolean;
  onBadgeCountChange: (enable: boolean) => void;
}

type SettingsTab = 'accounts' | 'appearance' | 'keyboard' | 'notifications' | 'about';

export default function SettingsModal({
  onClose,
  accounts,
  onAddAccount,
  backgroundTheme,
  onBackgroundThemeChange,
  density,
  onDensityChange,
  showAvatars,
  onShowAvatarsChange,
  enableSounds,
  onEnableSoundsChange,
  desktopNotifications,
  onDesktopNotificationsChange,
  badgeCount,
  onBadgeCountChange,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('accounts');

  const tabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'accounts', label: 'Accounts', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '◐' },
    { id: 'keyboard', label: 'Keyboard', icon: '⌨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'about', label: 'About', icon: 'ℹ' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[720px] h-[580px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_18px_rgba(0,255,255,0.25)]"></div>
            <div>
              <h2 className="text-[16px] font-mono font-bold text-white/90">settings</h2>
              <p className="text-[11px] font-mono text-white/50">configure stella-mail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-white/[0.06] transition-all text-[18px]"
          >
            ×
          </button>
        </div>

        {/* Content Area with Tabs */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-[180px] border-r border-white/[0.08] p-3 flex-shrink-0">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-mono transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/[0.06] border border-white/[0.12] text-white/90'
                      : 'text-white/60 hover:bg-white/[0.03] hover:text-white/80 border border-transparent'
                  }`}
                >
                  <span className="text-[14px]">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'accounts' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-mono font-bold text-white/90 mb-1">Email Accounts</h3>
                  <p className="text-[11px] font-mono text-white/50 mb-6">Manage your connected email accounts</p>
                </div>

                <button
                  onClick={() => {
                    onAddAccount();
                    onClose();
                  }}
                  className="w-full px-4 py-3 bg-cyan-500/[0.15] border border-cyan-500/[0.22] rounded-xl text-[13px] font-mono text-cyan-400 hover:bg-cyan-500/[0.22] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-[16px]">+</span>
                  <span>Add New Email Account</span>
                </button>

                <div className="space-y-3">
                  <div className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-3">Connected Accounts ({accounts.length})</div>
                  {accounts.map((account) => {
                    const healthColor = account.healthStatus === 'good' ? 'bg-emerald-500' : account.healthStatus === 'reauth' ? 'bg-yellow-500' : 'bg-red-500';
                    return (
                      <div
                        key={account.id}
                        className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl"
                      >
                        <div className={`w-3 h-3 rounded-full ${healthColor} flex-shrink-0`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-mono text-white/85 font-bold">{account.name}</div>
                          <div className="text-[11px] font-mono text-white/50">{account.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {account.isPinned && (
                            <span className="px-2 py-0.5 rounded-md bg-cyan-500/[0.15] text-cyan-400 text-[10px] font-mono border border-cyan-500/[0.22]">pinned</span>
                          )}
                          {account.isInFavorites && (
                            <span className="px-2 py-0.5 rounded-md bg-yellow-500/[0.15] text-yellow-400 text-[10px] font-mono border border-yellow-500/[0.22]">fav</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-mono font-bold text-white/90 mb-1">Appearance</h3>
                  <p className="text-[11px] font-mono text-white/50 mb-6">Customize how Stella Mail looks</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[12px] font-mono text-white/70 mb-3 block">Background Theme</label>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { id: 'aurora', name: 'Aurora', colors: 'from-cyan-500/20 via-fuchsia-500/20 to-emerald-500/20' },
                        { id: 'sunset', name: 'Sunset', colors: 'from-orange-500/20 via-pink-500/20 to-yellow-500/20' },
                        { id: 'ocean', name: 'Ocean', colors: 'from-blue-500/20 via-teal-500/20 to-cyan-500/20' },
                        { id: 'forest', name: 'Forest', colors: 'from-green-500/20 via-emerald-500/20 to-lime-500/20' },
                        { id: 'midnight', name: 'Midnight', colors: 'from-indigo-500/20 via-purple-500/20 to-violet-500/20' },
                        { id: 'neon', name: 'Neon', colors: 'from-pink-500/20 via-cyan-500/20 to-lime-500/20' },
                      ] as const).map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => onBackgroundThemeChange(theme.id)}
                          className={`p-3 rounded-xl border transition-all ${
                            backgroundTheme === theme.id
                              ? 'border-white/[0.22] ring-2 ring-cyan-500/30'
                              : 'border-white/[0.06] hover:border-white/[0.10]'
                          }`}
                        >
                          <div className={`w-full h-12 rounded-lg bg-gradient-to-br ${theme.colors} mb-2`}></div>
                          <div className="text-[11px] font-mono text-white/80 text-center">{theme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[12px] font-mono text-white/70 mb-2 block">Density</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['compact', 'comfortable', 'spacious'] as const).map((d) => (
                        <button
                          key={d}
                          onClick={() => onDensityChange(d)}
                          className={`p-3 rounded-xl border text-[11px] font-mono transition-all ${
                            density === d
                              ? 'bg-white/[0.06] border-white/[0.12] text-white/90'
                              : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:border-white/[0.10]'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div>
                      <div className="text-[12px] font-mono text-white/80">Show Avatars</div>
                      <div className="text-[10px] font-mono text-white/50">Display profile pictures in thread list</div>
                    </div>
                    <button
                      onClick={() => onShowAvatarsChange(!showAvatars)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        showAvatars ? 'bg-cyan-500/[0.30]' : 'bg-white/[0.10]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-all mt-0.5 ${
                          showAvatars ? 'ml-5' : 'ml-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keyboard' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-mono font-bold text-white/90 mb-1">Keyboard Shortcuts</h3>
                  <p className="text-[11px] font-mono text-white/50 mb-6">Essential shortcuts for inbox zero</p>
                </div>

                <div className="space-y-2">
                  {[
                    { key: 'j / k', action: 'Navigate up/down', category: 'Navigation' },
                    { key: 'Tab', action: 'Cycle focus zones', category: 'Navigation' },
                    { key: '[ / ]', action: 'Switch pinned accounts', category: 'Accounts' },
                    { key: '0', action: 'All accounts unified', category: 'Accounts' },
                    { key: '9', action: 'Favorites unified', category: 'Accounts' },
                    { key: 'g g', action: 'Open account picker', category: 'Accounts' },
                    { key: 'i / a / d / t', action: 'Jump to folder', category: 'Folders' },
                    { key: 'e', action: 'Archive thread', category: 'Actions' },
                    { key: 'm', action: 'Move to folder', category: 'Actions' },
                    { key: 'Space', action: 'Toggle read/unread', category: 'Actions' },
                    { key: 's', action: 'Star/unstar', category: 'Actions' },
                    { key: 'Enter', action: 'Open/archive & next', category: 'Actions' },
                    { key: '?', action: 'Show help', category: 'Global' },
                    { key: 'Esc', action: 'Close/back', category: 'Global' },
                  ].reduce((acc, shortcut) => {
                    const lastGroup = acc[acc.length - 1];
                    if (!lastGroup || lastGroup.category !== shortcut.category) {
                      acc.push({ category: shortcut.category, shortcuts: [shortcut] });
                    } else {
                      lastGroup.shortcuts.push(shortcut);
                    }
                    return acc;
                  }, [] as Array<{ category: string; shortcuts: Array<{key: string; action: string; category: string}> }>).map((group) => (
                    <div key={group.category}>
                      <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider mb-2 mt-4">{group.category}</div>
                      <div className="space-y-1">
                        {group.shortcuts.map((shortcut) => (
                          <div
                            key={shortcut.key}
                            className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-lg"
                          >
                            <span className="text-[11px] font-mono text-white/70">{shortcut.action}</span>
                            <kbd className="px-2 py-0.5 bg-white/[0.06] border border-white/[0.10] rounded-md text-[10px] font-mono text-white/90">
                              {shortcut.key}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-mono font-bold text-white/90 mb-1">Notifications</h3>
                  <p className="text-[11px] font-mono text-white/50 mb-6">Configure notification preferences</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div>
                      <div className="text-[12px] font-mono text-white/80">Desktop Notifications</div>
                      <div className="text-[10px] font-mono text-white/50">Show notifications for new emails</div>
                    </div>
                    <button
                      onClick={() => onDesktopNotificationsChange(!desktopNotifications)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        desktopNotifications ? 'bg-cyan-500/[0.30]' : 'bg-white/[0.10]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-all mt-0.5 ${
                          desktopNotifications ? 'ml-5' : 'ml-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div>
                      <div className="text-[12px] font-mono text-white/80">Sound Effects</div>
                      <div className="text-[10px] font-mono text-white/50">Play sounds for actions</div>
                    </div>
                    <button
                      onClick={() => onEnableSoundsChange(!enableSounds)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        enableSounds ? 'bg-cyan-500/[0.30]' : 'bg-white/[0.10]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-all mt-0.5 ${
                          enableSounds ? 'ml-5' : 'ml-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div>
                      <div className="text-[12px] font-mono text-white/80">Badge Count</div>
                      <div className="text-[10px] font-mono text-white/50">Show unread count in app icon</div>
                    </div>
                    <button
                      onClick={() => onBadgeCountChange(!badgeCount)}
                      className={`w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        badgeCount ? 'bg-cyan-500/[0.30]' : 'bg-white/[0.10]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow-md transition-all mt-0.5 ${
                          badgeCount ? 'ml-5' : 'ml-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[15px] font-mono font-bold text-white/90 mb-1">About Stella Mail</h3>
                  <p className="text-[11px] font-mono text-white/50 mb-6">Version and information</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow-[0_0_40px_rgba(0,255,255,0.2)] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                    </div>
                    <div className="text-[14px] font-mono font-bold text-white/90 mb-1">Stella Mail</div>
                    <div className="text-[11px] font-mono text-white/50 mb-3">Version 1.0.0</div>
                    <div className="text-[10px] font-mono text-white/40">Built with Next.js & TypeScript</div>
                  </div>

                  <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                    <div className="text-[11px] font-mono text-white/70 leading-relaxed space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/50">Two-tier account system</span>
                        <span className="text-cyan-400">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Keyboard-first workflow</span>
                        <span className="text-cyan-400">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Dark Stella aesthetic</span>
                        <span className="text-cyan-400">✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50">Inbox zero optimized</span>
                        <span className="text-cyan-400">✓</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <a
                      href="https://github.com/sgauth0/email-code"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      github.com/sgauth0/email-code
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
