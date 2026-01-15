'use client';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl m-4 border-2 border-purple-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ⌨️ Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                k
              </kbd>
              <span className="text-gray-700">Next email/folder</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                j
              </kbd>
              <span className="text-gray-700">Previous email/folder</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                e
              </kbd>
              <span className="text-gray-700">Archive</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                #
              </kbd>
              <span className="text-gray-700">Delete</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                s
              </kbd>
              <span className="text-gray-700">Star / Unstar</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                Tab
              </kbd>
              <span className="text-gray-700">Switch sidebar/emails</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                ?
              </kbd>
              <span className="text-gray-700">Show help</span>
            </div>

            <div className="flex items-center gap-3">
              <kbd className="px-3 py-2 bg-purple-100 rounded-lg font-mono font-bold text-purple-700 border-2 border-purple-300">
                Esc
              </kbd>
              <span className="text-gray-700">Close / Back</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-purple-800 mb-2">✨ Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use j/k to quickly navigate through your inbox</li>
              <li>• Press e to archive emails you've read</li>
              <li>• Star important emails with s for quick access</li>
              <li>• The unified inbox shows all emails from all accounts</li>
              <li>• New emails appear automatically every 30 seconds</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          Got it! ✨
        </button>
      </div>
    </div>
  );
}

