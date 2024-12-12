'use client';
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Import Game with no SSR
const Game = dynamic(() => import('../components/Game'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={{ background: '#000000', minHeight: '100vh' }}>
        <Game />
      </div>
    </Suspense>
  );
}