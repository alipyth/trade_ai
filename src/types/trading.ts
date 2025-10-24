export interface TechnicalIndicators {
  ema20: number;
  macd: number;
  rsi7: number;
  rsi14: number;
}

export interface CoinData {
  symbol: string;
  currentPrice: number;
  indicators: TechnicalIndicators;
  openInterest: number;
  fundingRate: number;
  priceHistory: number[];
  emaHistory: number[];
  macdHistory: number[];
  rsiHistory: number[];
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  unrealizedPnl: number;
  entryTime: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp: number;
  reason: string;
  confidence: number;
}

export interface Portfolio {
  cash: number;
  totalValue: number;
  positions: Position[];
  trades: Trade[];
  totalReturn: number;
}

export interface AIDecision {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  quantity?: number;
  stopLoss?: number;
  takeProfit?: number;
}