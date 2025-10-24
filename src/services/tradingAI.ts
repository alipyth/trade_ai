import { CoinData, AIDecision } from '@/types/trading';

export class TradingAI {
  analyzeMarket(coinData: CoinData): AIDecision {
    const { symbol, currentPrice, indicators } = coinData;
    const { rsi7, rsi14, macd, ema20 } = indicators;

    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 0;
    let reasoning = '';
    let stopLoss: number | undefined;
    let takeProfit: number | undefined;

    // RSI-based signals
    const oversold = rsi7 < 30 || rsi14 < 30;
    const overbought = rsi7 > 70 || rsi14 > 70;

    // MACD signals
    const macdBullish = macd > 0;
    const macdBearish = macd < 0;

    // EMA signals
    const priceAboveEMA = currentPrice > ema20;
    const priceBelowEMA = currentPrice < ema20;

    // BUY signals
    if (oversold && macdBullish && priceAboveEMA) {
      action = 'BUY';
      confidence = 0.85;
      reasoning = `Strong buy signal: RSI oversold (${rsi7.toFixed(2)}), MACD bullish (${macd.toFixed(2)}), price above EMA20`;
      stopLoss = currentPrice * 0.98; // 2% stop loss
      takeProfit = currentPrice * 1.04; // 4% take profit
    } else if (oversold && macdBullish) {
      action = 'BUY';
      confidence = 0.70;
      reasoning = `Moderate buy signal: RSI oversold (${rsi7.toFixed(2)}), MACD bullish (${macd.toFixed(2)})`;
      stopLoss = currentPrice * 0.98;
      takeProfit = currentPrice * 1.03;
    } else if (oversold && priceAboveEMA) {
      action = 'BUY';
      confidence = 0.60;
      reasoning = `Weak buy signal: RSI oversold (${rsi7.toFixed(2)}), price above EMA20`;
      stopLoss = currentPrice * 0.99;
      takeProfit = currentPrice * 1.02;
    }

    // SELL signals
    if (overbought && macdBearish && priceBelowEMA) {
      action = 'SELL';
      confidence = 0.85;
      reasoning = `Strong sell signal: RSI overbought (${rsi7.toFixed(2)}), MACD bearish (${macd.toFixed(2)}), price below EMA20`;
    } else if (overbought && macdBearish) {
      action = 'SELL';
      confidence = 0.70;
      reasoning = `Moderate sell signal: RSI overbought (${rsi7.toFixed(2)}), MACD bearish (${macd.toFixed(2)})`;
    } else if (overbought && priceBelowEMA) {
      action = 'SELL';
      confidence = 0.60;
      reasoning = `Weak sell signal: RSI overbought (${rsi7.toFixed(2)}), price below EMA20`;
    }

    // HOLD conditions
    if (action === 'HOLD') {
      reasoning = `No clear signal: RSI=${rsi7.toFixed(2)}, MACD=${macd.toFixed(2)}, Price vs EMA=${((currentPrice - ema20) / ema20 * 100).toFixed(2)}%`;
      confidence = 0.5;
    }

    return {
      symbol,
      action,
      confidence,
      reasoning,
      stopLoss,
      takeProfit,
    };
  }

  calculatePositionSize(
    availableCash: number,
    price: number,
    confidence: number,
    leverage: number = 1
  ): number {
    // Risk 2-5% of portfolio based on confidence
    const riskPercent = 0.02 + (confidence * 0.03);
    const riskAmount = availableCash * riskPercent;
    const positionSize = (riskAmount * leverage) / price;
    return Math.floor(positionSize * 100) / 100; // Round to 2 decimals
  }
}