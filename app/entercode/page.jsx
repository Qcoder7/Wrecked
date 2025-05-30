import React, { Suspense } from 'react';
import CheckEnctokenClient from './CheckEnctokenClient';

export default function EnterCodePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-800 text-white flex items-center justify-center p-4">
      <Suspense fallback={<h1>Loading...</h1>}>
        <CheckEnctokenClient />
      </Suspense>
    </div>
  );
}
