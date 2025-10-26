export type ExchangeType = 'binance' | 'bybit' | 'okx' | 'kucoin';
export type TradingMode = 'demo' | 'live';

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  testnet?: boolean;
}

export interface ExchangeConfig {
  type: ExchangeType;
  mode: TradingMode;
  credentials?: ExchangeCredentials;
}

export interface ExchangeBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface ExchangeOrder {
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED';
  timestamp: number;
}

export interface ExchangePosition {
  symbol: string;
  side: 'LONG' | 'SHORT';
  quantity: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  liquidationPrice?: number;
}