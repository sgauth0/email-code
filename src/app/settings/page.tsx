'use client';

import { useState } from 'react';
import Link from 'next/link';

type Section = 'appearance' | 'email' | 'notifications' | 'sync' | 'keyboard' | 'privacy' | 'advanced';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>('appearance');
  const [settings, setSettings] = useState({
    theme: 'kawaii',
    fontSize: 'medium',
    density: 'comfortable',
    autoMarkAsRead: true,
    markAsReadDelay: 3,
    showPreviewPane: true,
    conversationView: true,
    desktopNotifications: true,
    soundEnabled: true,
    notifyOnlyImportant: false,
    syncInterval: 30,
    autoSync: true,
    syncOnStartup: true,
    keyboardShortcutsEnabled: true,
    vimMode: false,
    loadImages: 'always',
    trackingProtection: true,
    experimentalFeatures: false,
    developerMode: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sections = [
    { id: 'appearance' as Section, icon: '🎨', label: 'Appearance' },
    { id: 'email' as Section, icon: '📧', label: 'Email' },
    { id: 'notifications' as Section, icon: '🔔', label: 'Notifications' },
    { id: 'sync' as Section, icon: '🔄', label: 'Sync' },
    { id: 'keyboard' as Section, icon: '⌨️', label: 'Keyboard' },
    { id: 'privacy' as Section, icon: '🔒', label: 'Privacy' },
    { id: 'advanced' as Section, icon: '🔧', label: 'Advanced' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <header className="bg-white/80 backdrop-blur-lg border-b-2 border-purple-200 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <Link href="/email" className="flex items-center gap-3 hover:opacity-80 transition-all">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              💌
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Kawaii Mail Settings
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex h-[calc(100vh-80px)]">
        <aside className="w-64 bg-white/80 backdrop-blur-lg border-r-2 border-purple-200 p-6">
          <div className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-3 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl">
            {activeSection === 'appearance' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🎨 Appearance</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Theme</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleChange('theme', 'kawaii')}
                        className={`p-6 rounded-2xl border-4 transition-all ${
                          settings.theme === 'kawaii'
                            ? 'border-purple-400 bg-gradient-to-r from-pink-100 to-purple-100'
                            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-4xl mb-2">💕</div>
                        <div className="font-semibold">Kawaii</div>
                        <div className="text-xs text-gray-600">Colorful & cute</div>
                      </button>
                      <button disabled className="p-6 rounded-2xl border-2 border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed">
                        <div className="text-4xl mb-2">🌙</div>
                        <div className="font-semibold">Dark</div>
                        <div className="text-xs text-gray-600">Coming soon</div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => handleChange('fontSize', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="xlarge">Extra Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Display Density</label>
                    <select
                      value={settings.density}
                      onChange={(e) => handleChange('density', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      <option value="compact">Compact</option>
                      <option value="comfortable">Comfortable</option>
                      <option value="spacious">Spacious</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">📧 Email Behavior</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Auto-mark as read</div>
                      <div className="text-sm text-gray-600">Mark emails as read when opened</div>
                    </div>
                    <button
                      onClick={() => handleToggle('autoMarkAsRead')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.autoMarkAsRead ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.autoMarkAsRead ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.autoMarkAsRead && (
                    <div className="ml-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Delay (seconds)</label>
                      <input
                        type="number"
                        value={settings.markAsReadDelay}
                        onChange={(e) => handleChange('markAsReadDelay', parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        min="0"
                        max="10"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Show preview pane</div>
                      <div className="text-sm text-gray-600">Display email content on the right</div>
                    </div>
                    <button
                      onClick={() => handleToggle('showPreviewPane')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.showPreviewPane ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.showPreviewPane ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Conversation view</div>
                      <div className="text-sm text-gray-600">Group related messages together</div>
                    </div>
                    <button
                      onClick={() => handleToggle('conversationView')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.conversationView ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.conversationView ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🔔 Notifications</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Desktop notifications</div>
                      <div className="text-sm text-gray-600">Show notifications for new emails</div>
                    </div>
                    <button
                      onClick={() => handleToggle('desktopNotifications')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.desktopNotifications ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.desktopNotifications ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Sound</div>
                      <div className="text-sm text-gray-600">Play sound for notifications</div>
                    </div>
                    <button
                      onClick={() => handleToggle('soundEnabled')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.soundEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Important only</div>
                      <div className="text-sm text-gray-600">Only notify for important emails</div>
                    </div>
                    <button
                      onClick={() => handleToggle('notifyOnlyImportant')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.notifyOnlyImportant ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.notifyOnlyImportant ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'sync' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🔄 Sync</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Auto-sync</div>
                      <div className="text-sm text-gray-600">Automatically check for new emails</div>
                    </div>
                    <button
                      onClick={() => handleToggle('autoSync')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.autoSync ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.autoSync ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {settings.autoSync && (
                    <div className="ml-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Sync interval (seconds)</label>
                      <input
                        type="number"
                        value={settings.syncInterval}
                        onChange={(e) => handleChange('syncInterval', parseInt(e.target.value))}
                        className="w-32 px-4 py-2 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                        min="10"
                        max="300"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Sync on startup</div>
                      <div className="text-sm text-gray-600">Check for emails when app starts</div>
                    </div>
                    <button
                      onClick={() => handleToggle('syncOnStartup')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.syncOnStartup ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.syncOnStartup ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'keyboard' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">⌨️ Keyboard</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Keyboard shortcuts</div>
                      <div className="text-sm text-gray-600">Enable keyboard navigation (j/k, etc.)</div>
                    </div>
                    <button
                      onClick={() => handleToggle('keyboardShortcutsEnabled')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.keyboardShortcutsEnabled ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.keyboardShortcutsEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl border-2 border-gray-200 opacity-60">
                    <div>
                      <div className="font-semibold text-gray-600">Vim mode</div>
                      <div className="text-sm text-gray-500">Use Vim-style navigation (coming soon)</div>
                    </div>
                    <button disabled className="w-14 h-8 rounded-full bg-gray-300 cursor-not-allowed">
                      <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-1" />
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <div className="font-semibold text-blue-900 mb-2">Current Shortcuts</div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                      <div><kbd className="px-2 py-1 bg-white rounded">j</kbd> Previous</div>
                      <div><kbd className="px-2 py-1 bg-white rounded">k</kbd> Next</div>
                      <div><kbd className="px-2 py-1 bg-white rounded">Tab</kbd> Switch panel</div>
                      <div><kbd className="px-2 py-1 bg-white rounded">?</kbd> Help</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🔒 Privacy & Security</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Load images</label>
                    <select
                      value={settings.loadImages}
                      onChange={(e) => handleChange('loadImages', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                    >
                      <option value="always">Always</option>
                      <option value="ask">Ask first</option>
                      <option value="never">Never</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Tracking protection</div>
                      <div className="text-sm text-gray-600">Block tracking pixels in emails</div>
                    </div>
                    <button
                      onClick={() => handleToggle('trackingProtection')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.trackingProtection ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.trackingProtection ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-purple-100">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">🔧 Advanced</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Experimental features</div>
                      <div className="text-sm text-gray-600">Enable beta features (may be unstable)</div>
                    </div>
                    <button
                      onClick={() => handleToggle('experimentalFeatures')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.experimentalFeatures ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.experimentalFeatures ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100">
                    <div>
                      <div className="font-semibold text-gray-800">Developer mode</div>
                      <div className="text-sm text-gray-600">Show advanced debugging options</div>
                    </div>
                    <button
                      onClick={() => handleToggle('developerMode')}
                      className={`w-14 h-8 rounded-full transition-all ${
                        settings.developerMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                        settings.developerMode ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                    <div className="font-semibold text-red-900 mb-2">⚠️ Danger Zone</div>
                    <div className="space-y-2">
                      <button className="w-full py-2 px-4 bg-white border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all font-semibold">
                        Clear All Data
                      </button>
                      <button className="w-full py-2 px-4 bg-white border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 transition-all font-semibold">
                        Reset to Defaults
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <button className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-lg">
                💾 Save All Settings
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
