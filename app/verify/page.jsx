'use client'; // REQUIRED for useSearchParams

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 text-white text-center p-4">
      <h1 className="text-2xl font-bold drop-shadow-lg animate-pulse">
        Please Wait While We Check Ur Token And Generate Link
      </h1>
    </div>
  );
}
