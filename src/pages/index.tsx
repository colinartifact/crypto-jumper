'use client';
import React from 'react';
import Game from '../components/Game';

export default function Home() {
  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh',
      background: '#000000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Game />
    </div>
  );
}