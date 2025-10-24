import { useState, useEffect, useCallback } from 'react';
import { CoinData, Portfolio, Trade, AIDecision } from '@/types/trading';
import { TradingAI } from '@/services/tradingAI';
import { PortfolioManager } from '@/services/portfolioManager';
import { CryptoPricesResponse } from '@/types/crypto';

const tradingAI = new TradingAI();
const portfolioManager = new PortfolioManager();

export const useTradingBot = (prices: CryptoPricesResponse | null, isEnabled: boolean) => {
  const [portfolio, setPortfolio] = useState<Portfolio>(portfolioManager.getPortfolio());
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [lastTrade, setLastTrade] = useState<Trade | null>(null);

  const analyzeCoin = useCallback((symbol: string, priceData: any): CoinData => {
    return {
      symbol,
      currentPrice: priceData.price,
      indicators: {
        ema20: priceData.price * 1.001, // Mock data - replace with real indicators
        macd: Math.random() * 10 - 5,
        rsi7: Math.random() * 100,
        rsi14: Math.random() * 100,
      },
      openInterest: 0,
      fundingRate: 0,
      priceHistory: [],
      emaHistory: [],
      macdHistory: [],
      rsiHistory: [],
    };
  }, []);

  const executeTrading = useCallback(() => {
    if (!prices || !isEnabled) return;

    const currentPrices: Record<string, number> = {};
    const newDecisions: AIDecision[] = [];

    Object.entries(prices.prices).forEach(([symbol, priceData]) => {
      currentPrices[symbol] = priceData.price;
      const coinData = analyzeCoin(symbol, priceData);
      const decision = tradingAI.analyzeMarket(coinData);
      newDecisions.push(decision);

      if (decision.action !== 'HOLD' && decision.confidence > 0.65) {
        const quantity = tradingAI.calculatePositionSize(
          portfolio.cash,
          priceData.price,
          decision.confidence
        );

        if (quantity > 0) {
          const trade = portfolioManager.executeTrade(decision, priceData.price, quantity);
          if (trade) {
            setLastTrade(trade);
          }
        }
      }
    });

    portfolioManager.updatePositions(currentPrices);
    setPortfolio(portfolioManager.getPortfolio());
    setDecisions(newDecisions);
  }, [prices, isEnabled, portfolio.cash, analyzeCoin]);

  useEffect(() => {
    if (isEnabled && prices) {
      executeTrading();
    }
  }, [prices, isEnabled, executeTrading]);

  const resetPortfolio = useCallback(() => {
    portfolioManager.resetPortfolio();
    setPortfolio(portfolioManager.getPortfolio());
    setDecisions([]);
    setLastTrade(null);
  }, []);

  return {
    portfolio,
    decisions,
    lastTrade,
    resetPortfolio,
  };
};