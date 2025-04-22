import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex flex-col items-center justify-center px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">LEEN</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Lend Any Token. Provide and access liquidity for your token.
        </p>
      </header>

      <div className="space-x-4">
        <Link href="/pool"  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-medium">Launch a Pool
        </Link>
        <Link href="/borrow"  className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-medium">Borrow
        </Link>
      </div>

      <footer className="absolute bottom-6 text-sm text-gray-400">
        Duke FinTech | Blockchain 564 | © {new Date().getFullYear()} LEEN Protocol
      </footer>
    </main>
  );
}
