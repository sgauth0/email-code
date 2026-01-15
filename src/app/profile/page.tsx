'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accounts, setAccounts] = useState([
    { id: 1, email: 'alex@personal.com', provider: 'Gmail', status: 'active', unread: 5 },
    { id: 2, email: 'alex@work.com', provider: 'Outlook', status: 'active', unread: 3 },
  ]);

  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    provider: 'gmail',
  });

  const handleAddAccount = () => {
    // In real app, this would authenticate with IMAP
    const account = {
      id: accounts.length + 1,
      email: newAccount.email,
      provider: newAccount.provider === 'gmail' ? 'Gmail' : newAccount.provider === 'outlook' ? 'Outlook' : 'Other',
      status: 'active',
      unread: 0,
    };
    setAccounts([...accounts, account]);
    setNewAccount({ email: '', password: '', provider: 'gmail' });
    setShowAddAccount(false);
  };

  const handleRemoveAccount = (id: number) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Radial gradient overlays */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[12%] w-[1200px] h-[700px] bg-pink-500/[0.07] rounded-full blur-3xl"></div>
        <div className="absolute top-[10%] right-[12%] w-[1000px] h-[600px] bg-fuchsia-500/[0.06] rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[70%] w-[900px] h-[600px] bg-emerald-500/[0.05] rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/[0.04] backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 shadow-2xl">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Link href="/email" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-full shadow-[0_0_18px_rgba(255,105,180,0.25)]"></div>
            <h1 className="text-sm font-mono tracking-wide text-white/80">
              stella-mail
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto p-4">
        <div className="bg-white/[0.04] backdrop-blur-xl rounded-[20px] shadow-[0_12px_40px_rgba(0,0,0,0.45)] border border-white/[0.08] p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-sm font-mono tracking-wider lowercase text-white/75 mb-1">
                accounts
              </h2>
              <p className="text-xs text-white/45 font-mono">manage email connections</p>
            </div>
            <button
              onClick={() => setShowAddAccount(true)}
              className="px-4 py-2 text-xs font-mono border border-white/[0.10] bg-white/[0.04] text-white/85 rounded-xl hover:border-white/[0.18] hover:bg-white/[0.06] hover:-translate-y-px transition-all"
            >
              + add
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="relative p-5 bg-black/[0.18] backdrop-blur rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="text-3xl font-mono text-white/90 mb-1">{accounts.length}</div>
              <div className="text-[10px] text-white/55 font-mono uppercase tracking-wider">connected</div>
            </div>
            <div className="relative p-5 bg-black/[0.18] backdrop-blur rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="text-3xl font-mono text-white/90 mb-1">
                {accounts.reduce((sum, acc) => sum + acc.unread, 0)}
              </div>
              <div className="text-[10px] text-white/55 font-mono uppercase tracking-wider">unread</div>
            </div>
            <div className="relative p-5 bg-black/[0.18] backdrop-blur rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] transition-all">
              <div className="text-3xl font-mono text-white/90 mb-1">156</div>
              <div className="text-[10px] text-white/55 font-mono uppercase tracking-wider">total</div>
            </div>
          </div>

          {/* Accounts List */}
          <div className="space-y-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="group flex items-center justify-between p-4 bg-black/[0.18] backdrop-blur rounded-2xl border border-white/[0.08] hover:bg-white/[0.04] hover:border-white/[0.12] hover:-translate-y-px transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_16px_rgba(255,255,255,0.10)]" style={{
                    background: account.id === 1 
                      ? 'linear-gradient(135deg, rgba(255,105,180,0.9), rgba(255,0,200,0.85))'
                      : 'linear-gradient(135deg, rgba(255,180,0,0.9), rgba(255,0,120,0.85))'
                  }}></div>
                  <div className="min-w-0">
                    <div className="text-sm text-white/88 font-mono">{account.email}</div>
                    <div className="flex items-center gap-2 text-[11px] mt-1 font-mono">
                      <span className="text-white/55">{account.provider.toLowerCase()}</span>
                      <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                      <span className="text-white/55">{account.status}</span>
                      {account.unread > 0 && (
                        <>
                          <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                          <span className="text-pink-400/80">{account.unread}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveAccount(account.id)}
                  className="px-3 py-1.5 text-[11px] font-mono text-white/55 hover:text-red-400 hover:bg-red-500/[0.10] rounded-lg border border-white/[0.10] hover:border-red-500/[0.22] transition-all opacity-0 group-hover:opacity-100"
                >
                  remove
                </button>
              </div>
            ))}
          </div>

          {/* Add Account Modal */}
          {showAddAccount && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
              <div className="bg-[rgba(12,15,26,0.92)] backdrop-blur-xl rounded-[22px] shadow-[0_18px_70px_rgba(0,0,0,0.60)] border border-white/[0.10] p-6 max-w-md w-full mx-4">
                <h3 className="text-sm font-mono tracking-wider lowercase text-white/75 mb-6">
                  add account
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-2 uppercase tracking-wider">
                      provider
                    </label>
                    <select
                      value={newAccount.provider}
                      onChange={(e) => setNewAccount({ ...newAccount, provider: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm font-mono border border-white/[0.10] bg-white/[0.03] text-white/88 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent backdrop-blur transition-all"
                    >
                      <option value="gmail">gmail</option>
                      <option value="outlook">outlook</option>
                      <option value="imap">imap (generic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-2 uppercase tracking-wider">
                      email
                    </label>
                    <input
                      type="email"
                      value={newAccount.email}
                      onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm font-mono border border-white/[0.10] bg-white/[0.03] text-white/88 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent backdrop-blur transition-all"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-white/60 mb-2 uppercase tracking-wider">
                      password
                    </label>
                    <input
                      type="password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm font-mono border border-white/[0.10] bg-white/[0.03] text-white/88 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent backdrop-blur transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="p-3 bg-pink-500/[0.08] backdrop-blur rounded-xl border border-pink-500/[0.20] text-xs text-pink-300/90 font-mono">
                    <div className="text-white/80 mb-1">security</div>
                    <div className="text-white/60">credentials encrypted and stored securely</div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddAccount}
                    className="flex-1 py-2.5 text-xs font-mono border border-pink-500/[0.20] bg-pink-500/[0.10] text-white/85 rounded-xl hover:border-pink-500/[0.30] hover:bg-pink-500/[0.15] transition-all"
                  >
                    connect
                  </button>
                  <button
                    onClick={() => setShowAddAccount(false)}
                    className="flex-1 py-2.5 text-xs font-mono border border-white/[0.10] bg-white/[0.04] text-white/75 rounded-xl hover:border-white/[0.18] hover:bg-white/[0.06] transition-all"
                  >
                    cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

