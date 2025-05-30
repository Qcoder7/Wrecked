'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [link, setLink] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyToken() {
      try {
        const res = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Invalid');

        const gen = await fetch('/api/generate-linkvertise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enctoken: data.enctoken }),
        });

        const { link } = await gen.json();
        setLink(link);
      } catch (err) {
        setError(err.message);
      }
    }

    if (token) verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 text-white text-center">
      {!link && !error && (
        <h1 className="text-2xl font-bold animate-pulse drop-shadow-md">
          Please Wait While We Check Ur Token And Generate Link
        </h1>
      )}
      {link && (
        <a
          href={link}
          className="mt-6 px-6 py-3 border-2 border-white rounded-lg text-white text-lg font-semibold hover:bg-white hover:text-black transition-all shadow-md"
        >
          Click Here To Proceed
        </a>
      )}
      {error && <p className="text-red-400 mt-4">{error}</p>}
    </div>
  );
}
