import { Candlestick } from '../types/game';

export function checkCollision(
    playerY: number,
    playerSize: number,
    candlestick: Candlestick
): boolean {
    const playerBottom = playerY + playerSize;
    
    return (
        playerBottom > candlestick.high ||
        playerY < candlestick.low
    );
}