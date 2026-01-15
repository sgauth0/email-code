'use client';

import { useState } from 'react';

interface OnboardAccountModalProps {
  onClose: () => void;
  onComplete: (account: {
    email: string;
    provider: 'gmail' | 'outlook' | 'imap';
    name: string;
  }) => void;
}

export default function OnboardAccountModal({ onClose, onComplete }: OnboardAccountModalProps) {
  const [step, setStep] = useState<'provider' | 'credentials' | 'connecting'>('provider');
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'imap' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [imapServer, setImapServer] = useState('');
  const [imapPort, setImapPort] = useState('993');

  const handleProviderSelect = (p: 'gmail' | 'outlook' | 'imap') => {
    setProvider(p);
    setStep('credentials');
  };

  const handleConnect = () => {
    setStep('connecting');
    
    // Simulate connection
    setTimeout(() => {
      onComplete({
        email,
        provider: provider!,
        name: name || email.split('@')[0],
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[580px] bg-white/[0.04] backdrop-blur-2xl border border-white/[0.12] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-mono font-bold text-white/90">Add Email Account</h2>
            <p className="text-[11px] font-mono text-white/50">Connect a new email address</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/70 hover:text-white/90 hover:bg-white/[0.06] transition-all"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'provider' && (
            <div className="space-y-4">
              <p className="text-[12px] font-mono text-white/70 mb-6">Choose your email provider</p>
              
              <button
                onClick={() => handleProviderSelect('gmail')}
                className="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-pink-400 flex items-center justify-center text-white font-mono font-bold text-[16px]">
                    G
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-mono font-bold text-white/90 group-hover:text-white transition-colors">Gmail</div>
                    <div className="text-[11px] font-mono text-white/50">Connect your Google account</div>
                  </div>
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">→</div>
                </div>
              </button>

              <button
                onClick={() => handleProviderSelect('outlook')}
                className="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white font-mono font-bold text-[16px]">
                    O
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-mono font-bold text-white/90 group-hover:text-white transition-colors">Outlook</div>
                    <div className="text-[11px] font-mono text-white/50">Connect your Microsoft account</div>
                  </div>
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">→</div>
                </div>
              </button>

              <button
                onClick={() => handleProviderSelect('imap')}
                className="w-full p-4 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:border-white/[0.12] transition-all text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-400 flex items-center justify-center text-white font-mono font-bold text-[16px]">
                    @
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-mono font-bold text-white/90 group-hover:text-white transition-colors">Other (IMAP)</div>
                    <div className="text-[11px] font-mono text-white/50">Configure custom IMAP settings</div>
                  </div>
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">→</div>
                </div>
              </button>
            </div>
          )}

          {step === 'credentials' && provider !== 'imap' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('provider')}
                className="text-[11px] font-mono text-white/50 hover:text-white/80 transition-colors mb-4"
              >
                ← Back to providers
              </button>

              <div>
                <label className="text-[12px] font-mono text-white/70 mb-2 block">Account Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Work, Personal, etc."
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                />
              </div>

              <div>
                <label className="text-[12px] font-mono text-white/70 mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={provider === 'gmail' ? 'you@gmail.com' : 'you@outlook.com'}
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                />
              </div>

              <div className="p-4 bg-pink-500/[0.10] border border-pink-500/[0.20] rounded-xl">
                <div className="text-[11px] font-mono text-pink-400 leading-relaxed">
                  <div className="font-bold mb-2">OAuth Authentication</div>
                  You'll be redirected to {provider === 'gmail' ? 'Google' : 'Microsoft'} to securely authorize access. 
                  Stella Mail will never see your password.
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={!email}
                className="w-full px-4 py-3 bg-pink-500/[0.15] border border-pink-500/[0.22] rounded-xl text-[13px] font-mono text-pink-400 hover:bg-pink-500/[0.22] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue with {provider === 'gmail' ? 'Google' : 'Microsoft'}
              </button>
            </div>
          )}

          {step === 'credentials' && provider === 'imap' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('provider')}
                className="text-[11px] font-mono text-white/50 hover:text-white/80 transition-colors mb-4"
              >
                ← Back to providers
              </button>

              <div>
                <label className="text-[12px] font-mono text-white/70 mb-2 block">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Email"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                />
              </div>

              <div>
                <label className="text-[12px] font-mono text-white/70 mb-2 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                />
              </div>

              <div>
                <label className="text-[12px] font-mono text-white/70 mb-2 block">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-mono text-white/70 mb-2 block">IMAP Server</label>
                  <input
                    type="text"
                    value={imapServer}
                    onChange={(e) => setImapServer(e.target.value)}
                    placeholder="imap.example.com"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-mono text-white/70 mb-2 block">Port</label>
                  <input
                    type="text"
                    value={imapPort}
                    onChange={(e) => setImapPort(e.target.value)}
                    placeholder="993"
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-[13px] font-mono text-white/90 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleConnect}
                disabled={!email || !password || !imapServer}
                className="w-full px-4 py-3 bg-pink-500/[0.15] border border-pink-500/[0.22] rounded-xl text-[13px] font-mono text-pink-400 hover:bg-pink-500/[0.22] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Connect Account
              </button>
            </div>
          )}

          {step === 'connecting' && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-pink-500/[0.20] border-t-pink-500 animate-spin"></div>
              <div className="text-[14px] font-mono text-white/80 mb-2">Connecting to {provider}...</div>
              <div className="text-[11px] font-mono text-white/50">This may take a few moments</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

