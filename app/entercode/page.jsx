'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function EnterCodePage() {
  const searchParams = useSearchParams();
  const enctoken = searchParams.get('token'); // or the correct param name if different

  const [valid, setValid] = useState(false);
  const [ipMatch, setIpMatch] = useState(false);
  const [username, setUsername] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkToken() {
      if (!enctoken) return;

      try {
        const res = await fetch('/api/check-enctoken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enctoken }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid encrypted token');

        setValid(true);
        setIpMatch(data.ipMatch);
      } catch (err) {
        setValid(false);
        setMessage(err.message);
      }
    }

    checkToken();
  }, [enctoken]);

  async function handleSend() {
    if (!username.trim()) {
      setMessage('Please enter a Discord username');
      return;
    }
    try {
      const res = await fetch('/api/senddiscord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken, username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');

      setMessage('Please Proceed To Discord For Continuing');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 p-6">
        <h1 className="text-white text-2xl font-bold drop-shadow-lg text-center">
          {message || 'Invalid or missing token'}
        </h1>
      </div>
    );
  }

  if (!ipMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 p-6">
        <h1 className="text-white text-2xl font-bold drop-shadow-lg text-center">
          IP mismatch detected.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 p-6">
      <h1 className="text-white text-2xl font-bold mb-6 drop-shadow-lg">
        Please Enter Your Discord Username In the Box Below
      </h1>
      <input
        type="text"
        placeholder="Discord Username"
        className="p-3 rounded-md text-black w-72 mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <label className="flex items-center space-x-2 text-white cursor-pointer mb-4 select-none">
        <input
          type="checkbox"
          checked={checkboxChecked}
          onChange={(e) => {
            setCheckboxChecked(e.target.checked);
            if (e.target.checked) handleSend();
          }}
        />
        <span>Send to Discord</span>
      </label>
      {message && (
        <p className="text-white font-semibold mt-4">{message}</p>
      )}
    </div>
  );
}
