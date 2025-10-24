import { useState, useEffect, useCallback } from 'react';
import { Portfolio, Trade, AIDecision } from '@/types/trading';
import { PortfolioManager } from '@/services/portfolioManager';
import { TechnicalIndicators } from '@/services/technicalIndicators';
import { AIService, AIConfig } from '@/services/aiService';
import { CryptoPricesResponse, PriceHistory } from '@/types/crypto';

const portfolioManager = new PortfolioManager();

export const useTradingBot = (
  prices: CryptoPricesResponse | null,
  priceHistory: Record<string, PriceHistory[]>,
  isEnabled: boolean,
  aiConfig: AIConfig
) => {
  const [portfolio, setPortfolio] = useState<Portfolio>(portfolioManager.getPortfolio());
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [aiReports, setAiReports] = useState<Array<{
    timestamp: number;
    symbol: string;
    analysis: string;
    decision: string;
  }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeAndTrade = useCallback(async () => {
    if (!prices || !isEnabled || isAnalyzing) return;

    setIsAnalyzing(true);
    const aiService = new AIService(aiConfig);
    const currentPrices: Record<string, number> = {};
    const newDecisions: AIDecision[] = [];
    const newReports: typeof aiReports = [];

    for (const [symbol, priceData] of Object.entries(prices.prices)) {
      currentPrices[symbol] = priceData.price;
      const history = priceHistory[symbol] || [];
      
      if (history.length < 20) continue;

      const priceValues = history.map(h => h.price);
      const rsi7 = TechnicalIndicators.calculateRSI(priceValues, 7);
      const rsi14 = TechnicalIndicators.calculateRSI(priceValues, 14);
      const ema20 = TechnicalIndicators.calculateEMA(priceValues, 20);
      const { macd } = TechnicalIndicators.calculateMACD(priceValues);

      const analysis = await aiService.analyzeMarket(symbol, priceData.price, {
        rsi7,
        rsi14,
        macd,
        ema20
      });

      const decision: AIDecision = {
        symbol,
        action: analysis.decision,
        confidence: analysis.confidence,
        reasoning: analysis.reasoning,
        stopLoss: analysis.stopLoss,
        takeProfit: analysis.takeProfit
      };

      newDecisions.push(decision);
      newReports.push({
        timestamp: Date.now(),
        symbol,
        analysis: analysis.reasoning,
        decision: analysis.decision
      });

      if (decision.action !== 'HOLD' && decision.confidence > 0.65) {
        const riskPercent = 0.02 + (decision.confidence * 0.03);
        const riskAmount = portfolio.cash * riskPercent;
        const quantity = Math.floor((riskAmount / priceData.price) * 100) / 100;

        if (quantity > 0) {
          const trade = portfolioManager.executeTrade(decision, priceData.price, quantity);
          if (trade) {
            console.log('Trade executed:', trade);
          }
        }
      }
    }

    portfolioManager.updatePositions(currentPrices);
    setPortfolio(portfolioManager.getPortfolio());
    setDecisions(newDecisions);
    setAiReports(prev => [...newReports, ...prev].slice(0, 50));
    setIsAnalyzing(false);
  }, [prices, priceHistory, isEnabled, aiConfig, portfolio.cash, isAnalyzing]);

  useEffect(() => {
    if (isEnabled && prices) {
      analyzeAndTrade();
    }
  }, [prices, isEnabled]);

  const resetPortfolio = useCallback(() => {
    portfolioManager.resetPortfolio();
    setPortfolio(portfolioManager.getPortfolio());
    setDecisions([]);
    setAiReports([]);
  }, []);

  return {
    portfolio,
    decisions,
    aiReports,
    isAnalyzing,
    resetPortfolio,
  };
};