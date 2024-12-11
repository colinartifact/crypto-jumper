import React, { useState, useEffect, useRef } from 'react';

// Game constants
const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GRAVITY: 0.5,
  JUMP_FORCE: -10,
  PLAYER_SIZE: 30,
  OBSTACLE_SPEED: 3
};

// Add the Candlestick interface
interface Candlestick {
    open: number;
    high: number;
    low: number;
    close: number;
    x: number;
}

const Game: React.FC = () => {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Move gameOver function inside the component
  const gameOver = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  };

  // Start game function
  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setPlayerY(300); // Reset player position
    setVelocity(0);  // Reset velocity
  };

  // Candlestick drawing function
  function drawCandlestick(ctx: CanvasRenderingContext2D, candlestick: Candlestick) {
    const candleWidth = 10;
    const isGreen = candlestick.close > candlestick.open;
    
    ctx.strokeStyle = isGreen ? '#00FF00' : '#FF0000';
    ctx.lineWidth = 2;
  
    // Draw vertical line
    ctx.beginPath();
    ctx.moveTo(candlestick.x, candlestick.high);
    ctx.lineTo(candlestick.x, candlestick.low);
    ctx.stroke();
  
    // Draw candle body
    ctx.fillStyle = isGreen ? '#00FF00' : '#FF0000';
    ctx.fillRect(
      candlestick.x - candleWidth/2,
      candlestick.open,
      candleWidth,
      candlestick.close - candlestick.open
    );
  }

  // Jump function
  const handleJump = () => {
    if (isPlaying) {
      setVelocity(GAME_CONSTANTS.JUMP_FORCE);
    }
  };

  // Draw game elements
  const drawGame = (ctx: CanvasRenderingContext2D, currentPlayerY: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Draw player (red square)
    ctx.fillStyle = 'red';
    ctx.fillRect(50, currentPlayerY, GAME_CONSTANTS.PLAYER_SIZE, GAME_CONSTANTS.PLAYER_SIZE);
    
    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  };

  // Game loop using useEffect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      if (!isPlaying) return;

      // Update player position
      const newVelocity = velocity + GAME_CONSTANTS.GRAVITY;
      const newPlayerY = playerY + newVelocity;

      // Check boundaries
      if (newPlayerY < 0 || newPlayerY > GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.PLAYER_SIZE) {
        gameOver(); // Use gameOver instead of just setIsPlaying(false)
        return;
      }

      setVelocity(newVelocity);
      setPlayerY(newPlayerY);
      
      // Increment score while playing
      setScore(prevScore => prevScore + 1);

      // Draw game state
      drawGame(ctx, newPlayerY);

      // Continue game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, playerY, velocity, score, highScore]); // Added highScore to dependencies

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.CANVAS_WIDTH}
        height={GAME_CONSTANTS.CANVAS_HEIGHT}
        onClick={handleJump}
        className="game-canvas"
        style={{ border: '2px solid black' }}
      />
      {!isPlaying && (
        <button 
          onClick={startGame}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            marginTop: '20px'
          }}
        >
          {score > 0 ? 'Play Again' : 'Start Game'}
        </button>
      )}
    </div>
  );
};

export default Game;