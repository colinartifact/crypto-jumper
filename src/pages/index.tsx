'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Game component with no SSR
const Game = dynamic(() => import('../components/Game'), { 
  ssr: false 
});

const Home: React.FC = () => {
  return (
    <div>
      <Game />
    </div>
  );
};

export default Home;