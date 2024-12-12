import React, { useState, useEffect, useRef } from 'react';
import { Candlestick } from '../types/game';
import { checkCollision } from '../utils/collision';

// Game constants
const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GRAVITY: 0.5,
  JUMP_FORCE: -10,
  PLAYER_SIZE: 30,
  CANDLE_WIDTH: 20,     // Added: width of each candlestick
  CANDLE_SPEED: 2,      // Added: speed of candlestick movement
  CANDLE_SPACING: 30    // Added: space between candlesticks
};

const Game: React.FC = () => {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state management functions
  const gameOver = () => {
    setIsPlaying(false);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score.toString());
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setPlayerY(300);
    setVelocity(0);
    
    // Initialize candlesticks across the screen width
    const numCandlesticks = Math.ceil(GAME_CONSTANTS.CANVAS_WIDTH / GAME_CONSTANTS.CANDLE_SPACING);
    const initialCandlesticks = Array(numCandlesticks).fill(null).map((_, index) => 
      generateCandlestick(GAME_CONSTANTS.CANVAS_WIDTH + (index * GAME_CONSTANTS.CANDLE_SPACING))
    );
    setCandlesticks(initialCandlesticks);
  };
  

  // Candlestick generation and drawing
  const generateCandlestick = (x: number): Candlestick => {
  const baseHeight = GAME_CONSTANTS.CANVAS_HEIGHT * 0.7; // Base height for candlesticks
  const variation = Math.random() * 100; // Height variation
  
  return {
    x: x,
    open: baseHeight - variation,
    close: baseHeight - variation - (Math.random() * 40),
    high: baseHeight - variation - 60,
    low: baseHeight
  };
  };
  // Update drawCandlestick for better visibility
function drawCandlestick(ctx: CanvasRenderingContext2D, candlestick: Candlestick) {
  const candleWidth = GAME_CONSTANTS.CANDLE_WIDTH;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Draw vertical line
  ctx.beginPath();
  ctx.moveTo(candlestick.x, candlestick.high);
  ctx.lineTo(candlestick.x, candlestick.low);
  ctx.stroke();

  // Draw candle body
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(
    candlestick.x - candleWidth/2,
    candlestick.open,
    candleWidth,
    candlestick.close - candlestick.open
  );
  }

  // Player controls
  const handleJump = () => {
    if (isPlaying) {
      setVelocity(GAME_CONSTANTS.JUMP_FORCE);
    }
  };

  // Game rendering
  const drawGame = (ctx: CanvasRenderingContext2D, currentPlayerY: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONSTANTS.CANVAS_WIDTH, GAME_CONSTANTS.CANVAS_HEIGHT);
    
    // Draw candlesticks
    candlesticks.forEach(candlestick => {
      drawCandlestick(ctx, candlestick);
    });

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(50, currentPlayerY, GAME_CONSTANTS.PLAYER_SIZE, GAME_CONSTANTS.PLAYER_SIZE);
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
  };

  // Game loop
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
    
      // Update candlesticks
      const updatedCandlesticks = candlesticks.map(candlestick => ({
        ...candlestick,
        x: candlestick.x - GAME_CONSTANTS.CANDLE_SPEED
      }));
    
      // Remove offscreen candlesticks and add new ones
      if (updatedCandlesticks[0] && updatedCandlesticks[0].x < -GAME_CONSTANTS.CANDLE_WIDTH) {
        // Remove the leftmost candlestick
        updatedCandlesticks.shift();
        
        // Add a new candlestick at the right
        const lastCandlestick = updatedCandlesticks[updatedCandlesticks.length - 1];
        const newX = lastCandlestick ? lastCandlestick.x + GAME_CONSTANTS.CANDLE_SPACING : GAME_CONSTANTS.CANVAS_WIDTH;
        updatedCandlesticks.push(generateCandlestick(newX));
      }
    
      // Update state
      setCandlesticks(updatedCandlesticks);
      setVelocity(newVelocity);
      setPlayerY(newPlayerY);
      setScore(prevScore => prevScore + 1);
    
      // Draw game state
      drawGame(ctx, newPlayerY);
    
      // Continue game loop
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, playerY, velocity, score, highScore, candlesticks]);

  // Render component
  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_CONSTANTS.CANVAS_WIDTH}
        height={GAME_CONSTANTS.CANVAS_HEIGHT}
        onClick={handleJump}
        className="game-canvas"
        style={{ border: '2px solid white' }}
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