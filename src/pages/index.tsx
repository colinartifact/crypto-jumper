'use client';
import React from 'react';
import Game from '../components/Game';

export default function Home() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh',
      background: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <Game />
    </div>
  );
}