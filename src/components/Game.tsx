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
  CANDLE_WIDTH: 20,
  CANDLE_SPEED: 1,        // Reduced speed
  CANDLE_SPACING: 25,     // Slightly reduced spacing
  HEIGHT_VARIATION: 15,   // Smaller variation for smoother changes
  MAX_HEIGHT: 400,        // Maximum height from bottom
  MIN_HEIGHT: 150,        // Minimum height from bottom
  SMOOTHING_FACTOR: 0.8   // Controls how gradual height changes are (0-1)
};

// Add this to track the previous height
const [prevHeight, setPrevHeight] = useState(GAME_CONSTANTS.MIN_HEIGHT);

const Game: React.FC = () => {
  // State declarations
  const [prevHeight, setPrevHeight] = useState(GAME_CONSTANTS.MIN_HEIGHT);
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
    
    let currentHeight = GAME_CONSTANTS.MIN_HEIGHT;
    const numCandlesticks = Math.ceil(GAME_CONSTANTS.CANVAS_WIDTH / GAME_CONSTANTS.CANDLE_SPACING);
    
    const initialCandlesticks = Array(numCandlesticks).fill(null).map((_, index) => {
      const candlestick = generateCandlestick(
        GAME_CONSTANTS.CANVAS_WIDTH + (index * GAME_CONSTANTS.CANDLE_SPACING),
        currentHeight
      );
      currentHeight = GAME_CONSTANTS.CANVAS_HEIGHT - candlestick.high;  // Store height for next candlestick
      return candlestick;
    });
    
    setCandlesticks(initialCandlesticks);
    setPrevHeight(currentHeight);
  };
  

  // Candlestick generation and drawing
  const generateCandlestick = (x: number, previousHeight: number): Candlestick => {
    // Calculate new height with smoothing
    const targetHeight = Math.random() * (GAME_CONSTANTS.MAX_HEIGHT - GAME_CONSTANTS.MIN_HEIGHT) 
      + GAME_CONSTANTS.MIN_HEIGHT;
    
    // Smooth the height change
    const smoothedHeight = previousHeight + 
      (targetHeight - previousHeight) * (1 - GAME_CONSTANTS.SMOOTHING_FACTOR);
    
    // Ensure height stays within bounds
    const height = Math.max(
      GAME_CONSTANTS.MIN_HEIGHT,
      Math.min(GAME_CONSTANTS.MAX_HEIGHT, smoothedHeight)
    );
  
    return {
      x: x,
      open: GAME_CONSTANTS.CANVAS_HEIGHT,  // Bottom of playable area
      close: GAME_CONSTANTS.CANVAS_HEIGHT,  // Bottom of playable area
      high: GAME_CONSTANTS.CANVAS_HEIGHT - height,  // Height from bottom
      low: GAME_CONSTANTS.CANVAS_HEIGHT,    // Bottom of playable area
    };
  };
  // Update drawCandlestick for better visibility
// Update drawCandlestick function
function drawCandlestick(ctx: CanvasRenderingContext2D, candlestick: Candlestick) {
  const candleWidth = GAME_CONSTANTS.CANDLE_WIDTH;
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Draw main body (rectangle from bottom)
  ctx.fillRect(
    candlestick.x - candleWidth/2,
    candlestick.high,  // Start from the top point
    candleWidth,
    GAME_CONSTANTS.CANVAS_HEIGHT - candlestick.high  // Extend to bottom
  );

  // Draw top wick
  ctx.beginPath();
  ctx.moveTo(candlestick.x, candlestick.high - 20);  // Extend wick up 20 pixels
  ctx.lineTo(candlestick.x, candlestick.high);
  ctx.stroke();
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
        x: candlestick.x - GAME_CONSTANTS.CANDLE_SPEED  // Slower movement
      }));
    
      // Remove offscreen candlesticks and add new ones
      if (updatedCandlesticks[0] && updatedCandlesticks[0].x < -GAME_CONSTANTS.CANDLE_WIDTH) {
        updatedCandlesticks.shift();
        
        const lastCandlestick = updatedCandlesticks[updatedCandlesticks.length - 1];
        const newX = lastCandlestick.x + GAME_CONSTANTS.CANDLE_SPACING;
        
        const newHeight = GAME_CONSTANTS.CANVAS_HEIGHT - lastCandlestick.high;
        const newCandlestick = generateCandlestick(newX, newHeight);
        updatedCandlesticks.push(newCandlestick);
        setPrevHeight(GAME_CONSTANTS.CANVAS_HEIGHT - newCandlestick.high);
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
  }, [isPlaying, playerY, velocity, score, highScore, candlesticks, prevHeight]);

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