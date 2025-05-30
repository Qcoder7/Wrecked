'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [link, setLink] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyAndGenerate() {
      if (!token) return;

      try {
        // Call your verify-token API
        const res = await fetch('/api/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Invalid token');

        // Call your generate-linkvertise API
        const genRes = await fetch('/api/generate-linkvertise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enctoken: data.enctoken }),
        });
        const genData = await genRes.json();
        if (!genRes.ok) throw new Error(genData.error || 'Failed to generate link');

        setLink(genData.link);
      } catch (err) {
        setError(err.message);
      }
    }

    verifyAndGenerate();
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-800 to-purple-800 p-6">
      {!link && !error && (
        <h1 className="text-white text-2xl font-bold drop-shadow-lg animate-pulse text-center">
          Please Wait While We Check Ur Token And Generate Link
        </h1>
      )}
      {error && (
        <h1 className="text-red-400 text-xl font-semibold">{error}</h1>
      )}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 px-8 py-4 text-white border-2 border-white rounded-md font-semibold hover:bg-white hover:text-black transition"
        >
          Click Here To Proceed
        </a>
      )}
    </div>
  );
}
