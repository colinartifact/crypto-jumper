import React, { useState, useEffect, useRef } from 'react';
import { Candlestick } from '../types/game';
import { checkCollision } from '../utils/collision';  // Add this line

// Game constants
const GAME_CONSTANTS = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  GRAVITY: 0.5,
  JUMP_FORCE: -10,
  PLAYER_SIZE: 30,
  OBSTACLE_SPEED: 3
};

const Game: React.FC = () => {
  // State declarations
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(300);
  const [velocity, setVelocity] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([]);
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
    setPlayerY(300);
    setVelocity(0);

  // Initialize candlesticks
  const initialCandlesticks = Array(10).fill(null).map((_, index) => 
    generateCandlestick(GAME_CONSTANTS.CANVAS_WIDTH + index * 60)
  );
  setCandlesticks(initialCandlesticks);
  };
// Generate random candlesticks
const generateCandlestick = (x: number): Candlestick => {
  const basePrice = Math.random() * 200 + 200; // Base price between 200-400
  const open = basePrice;
  const close = basePrice + (Math.random() - 0.5) * 50;
  const high = Math.max(open, close) + Math.random() * 25;
  const low = Math.min(open, close) - Math.random() * 25;
  
  return { open, high, low, close, x };
};
  // Candlestick drawing function
  function drawCandlestick(ctx: CanvasRenderingContext2D, candlestick: Candlestick) {
    const candleWidth = 10;
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
    
    // Draw candlesticks
  candlesticks.forEach(candlestick => {
    drawCandlestick(ctx, candlestick);
  });
    // Draw player (red square)
    ctx.fillStyle = 'red';
    ctx.fillRect(50, currentPlayerY, GAME_CONSTANTS.PLAYER_SIZE, GAME_CONSTANTS.PLAYER_SIZE);
    
    // Draw score
    ctx.fillStyle = 'white';
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

      // Update candlesticks
      const updatedCandlesticks = candlesticks.map(candlestick => ({
        ...candlestick,
        x: candlestick.x - 2  // Move candlesticks to the left
      }));

        // Check collisions with candlesticks
        const collision = updatedCandlesticks.some(candlestick => 
          checkCollision(newPlayerY, GAME_CONSTANTS.PLAYER_SIZE, candlestick)
  );

        if (collision || newPlayerY < 0 || newPlayerY > GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.PLAYER_SIZE) {
          gameOver();
          return;
  }

        setCandlesticks(updatedCandlesticks);
        setVelocity(newVelocity);
        setPlayerY(newPlayerY);
        setScore(prevScore => prevScore + 1);
      
      // Check boundaries
      if (newPlayerY < 0 || newPlayerY > GAME_CONSTANTS.CANVAS_HEIGHT - GAME_CONSTANTS.PLAYER_SIZE) {
        gameOver(); // Use gameOver instead of just setIsPlaying(false)
        return;
      }

      setVelocity(newVelocity);
      setPlayerY(newPlayerY);
      
      // Remove offscreen candlesticks and add new ones
      if (updatedCandlesticks[0].x < -20) {
        updatedCandlesticks.shift();
        const lastCandlestick = updatedCandlesticks[updatedCandlesticks.length - 1];
        updatedCandlesticks.push(generateCandlestick(lastCandlestick.x + 60));
  }  
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