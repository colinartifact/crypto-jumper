export interface Candlestick {
    open: number;
    high: number;
    low: number;
    close: number;
    x: number;
  }
  
  export function generateCandlestick(x: number): Candlestick {
    const open = Math.random() * 300 + 150;
    const close = open + (Math.random() - 0.5) * 50;
    const high = Math.max(open, close) + Math.random() * 25;
    const low = Math.min(open, close) - Math.random() * 25;
    
    return { open, high, low, close, x };
  }