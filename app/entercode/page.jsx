'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function EnterCodePage() {
  const searchParams = useSearchParams();
  const enctoken = searchParams.get('');
  const [valid, setValid] = useState(false);
  const [username, setUsername] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enctoken) return;

    async function checkToken() {
      const res = await fetch('/api/check-enctoken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken }),
      });
      const data = await res.json();
      if (res.ok && data.valid) setValid(true);
      else setError('Invalid or mismatched IP.');
    }

    checkToken();
  }, [enctoken]);

  async function handleSubmit() {
    if (!username.trim()) return;
    try {
      const res = await fetch('/api/submit-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enctoken, username }),
      });
      if (res.ok) setDone(true);
      else setError('Submission failed');
    } catch (e) {
      setError('Network error');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 text-white text-center p-4">
      {done ? (
        <h1 className="text-2xl font-bold">Please Proceed To Discord For Continuing</h1>
      ) : valid ? (
        <>
          <h1 className="text-2xl mb-4">Please Enter Your Discord Username In the Box Below</h1>
          <input
            className="p-2 rounded text-black mb-4"
            placeholder="Discord Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input type="checkbox" onChange={handleSubmit} />
            <span>Confirm Submission</span>
          </label>
        </>
      ) : (
        <h1 className="text-xl">{error || 'Validating token...'}</h1>
      )}
    </div>
  );
}
