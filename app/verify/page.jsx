'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    async function verifyToken() {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!res.ok) throw new Error('Invalid token');
        const data = await res.json();

        const gen = await fetch('/api/generate-linkvertise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enctoken: data.enctoken }),
        });
        if (!gen.ok) throw new Error('Failed to generate link');
        const { link } = await gen.json();
        setLink(link);
      } catch (e) {
        setError(e.message);
      }
    }
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 p-4 text-white text-center">
      {!link && !error && (
        <h1 className="text-2xl font-bold drop-shadow-lg animate-pulse">Verifying token...</h1>
      )}
      {error && <p className="text-red-400">{error}</p>}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-6 py-3 rounded bg-white text-black font-semibold hover:bg-gray-200 transition"
        >
          Click Here to Proceed
        </a>
      )}
    </div>
  );
}
