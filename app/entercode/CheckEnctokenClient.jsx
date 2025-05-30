'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CheckEnctokenClient() {
  const searchParams = useSearchParams();
  const enctoken = searchParams.get('enctoken');

  const [status, setStatus] = useState('loading'); // loading, valid, invalid, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkToken() {
      if (!enctoken) {
        setStatus('invalid');
        setMessage('No token provided');
        return;
      }

      try {
        const res = await fetch('/api/check-enctoken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enctoken }),
        });
        const data = await res.json();

        if (res.ok && data.found) {
          setStatus('valid');
          setMessage('Please Enter Your Discord Username In the Box Below');
        } else {
          setStatus('invalid');
          setMessage('Invalid or expired token');
        }
      } catch {
        setStatus('error');
        setMessage('Failed to verify token');
      }
    }

    checkToken();
  }, [enctoken]);

  if (status === 'loading') {
    return (
      <h1 className="text-2xl font-bold drop-shadow-lg animate-pulse">
        Checking your token...
      </h1>
    );
  }

  if (status === 'invalid' || status === 'error') {
    return (
      <h1 className="text-2xl font-bold drop-shadow-lg">
        {message}
      </h1>
    );
  }

  // status === 'valid'
  return (
    <>
      <h1 className="text-2xl font-bold drop-shadow-lg mb-6">{message}</h1>
      {/* Textbox + checkbox + submit button goes here */}
    </>
  );
}
