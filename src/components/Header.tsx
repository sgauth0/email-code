'use client';

import Link from 'next/link';

interface HeaderProps {
  onSearch: (query: string) => void;
  onShowHelp: () => void;
}

export default function Header({ onSearch, onShowHelp }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b-2 border-purple-200 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
            💌
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Kawaii Mail
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onShowHelp}
            className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-110 shadow-md flex items-center justify-center"
            title="Help (Press ?)"
          >
            ❓
          </button>
          <Link href="/settings" className="w-10 h-10 bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-xl hover:from-blue-500 hover:to-pink-500 transition-all transform hover:scale-110 shadow-md flex items-center justify-center">
            ⚙️
          </Link>
          <Link href="/profile" className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center text-white font-bold shadow-md hover:scale-110 transition-all transform">
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}

