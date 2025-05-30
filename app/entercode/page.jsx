'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function EnterCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [discordUsername, setDiscordUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Get enctoken from URL query: ?=ENCTOKEN
  const enctoken = searchParams.get('') || ''; 

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!discordUsername) {
      setError('Please enter your Discord username');
      return;
    }

    try {
      // Check if enctoken and IP match
      const checkRes = await fetch('/api/check-enctoken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken }),
      });
      if (!checkRes.ok) throw new Error('Invalid or expired token');

      // Send Discord username and delete token
      const sendRes = await fetch('/api/send-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken, discordUsername }),
      });
      if (!sendRes.ok) throw new Error('Failed to send Discord username');

      setMessage('Verification successful! You can close this page.');
      setDiscordUsername('');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 to-pink-700 p-4 text-white text-center">
      <h1 className="text-3xl font-bold mb-6">Enter Your Discord Username</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          placeholder="Discord username#1234"
          value={discordUsername}
          onChange={(e) => setDiscordUsername(e.target.value)}
          className="px-4 py-2 rounded text-black text-lg"
          required
        />
        <button
          type="submit"
          className="bg-white text-purple-900 font-bold py-2 rounded hover:bg-gray-200 transition"
        >
          Verify
        </button>
      </form>
      {message && <p className="mt-4 text-green-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </div>
  );
}
