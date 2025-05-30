'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ClientWrapper() {
  const searchParams = useSearchParams();
  const enctoken = searchParams.get('enctoken');

  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [agreed, setAgreed] = useState(false);

  async function sendDiscord() {
    if (!username) {
      alert('Please enter your Discord username.');
      return;
    }
    try {
      const res = await fetch('/api/send-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken, username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setMessage('Please Proceed To Discord For Continuing');
    } catch (e) {
      setMessage('Error: ' + e.message);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 text-white text-center p-4">
      {!message ? (
        <>
          <h1 className="text-2xl font-bold mb-4 drop-shadow-lg">
            Please Enter Your Discord Username In the Box Below
          </h1>
          <input
            type="text"
            placeholder="Discord Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4 px-4 py-2 rounded text-black w-64"
          />
          <label className="mb-4 flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              className="w-5 h-5"
            />
            <span>I confirm my username is correct</span>
          </label>
          <button
            disabled={!agreed}
            onClick={sendDiscord}
            className={`px-6 py-3 rounded font-semibold drop-shadow-lg transition ${
              agreed
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Send
          </button>
        </>
      ) : (
        <h2 className="text-xl font-semibold drop-shadow-lg">{message}</h2>
      )}
    </div>
  );
}
