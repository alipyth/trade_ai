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
    chainOfThought: string;
    decision: string;
    confidence: number;
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
      const rsi7Values: number[] = [];
      const rsi14Values: number[] = [];
      const emaValues: number[] = [];
      const macdValues: number[] = [];

      // Calculate historical indicators
      for (let i = 14; i < priceValues.length; i++) {
        const slice = priceValues.slice(0, i + 1);
        rsi7Values.push(TechnicalIndicators.calculateRSI(slice, 7));
        rsi14Values.push(TechnicalIndicators.calculateRSI(slice, 14));
        emaValues.push(TechnicalIndicators.calculateEMA(slice, 20));
        macdValues.push(TechnicalIndicators.calculateMACD(slice).macd);
      }

      const currentRsi7 = TechnicalIndicators.calculateRSI(priceValues, 7);
      const currentRsi14 = TechnicalIndicators.calculateRSI(priceValues, 14);
      const currentEma20 = TechnicalIndicators.calculateEMA(priceValues, 20);
      const currentMacd = TechnicalIndicators.calculateMACD(priceValues).macd;

      const analysis = await aiService.analyzeMarket(
        symbol,
        priceData.price,
        {
          rsi7: currentRsi7,
          rsi14: currentRsi14,
          macd: currentMacd,
          ema20: currentEma20,
          priceHistory: priceValues,
          emaHistory: emaValues,
          macdHistory: macdValues,
          rsiHistory: rsi7Values
        },
        portfolio.positions,
        portfolio.totalValue,
        portfolio.cash
      );

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
        chainOfThought: analysis.chainOfThought,
        decision: analysis.decision,
        confidence: analysis.confidence
      });

      // Execute trades based on AI decision
      if (decision.action !== 'HOLD' && decision.confidence > 0.65) {
        const riskPercent = 0.02 + (decision.confidence * 0.03);
        const riskAmount = portfolio.cash * riskPercent;
        const quantity = Math.floor((riskAmount / priceData.price) * 100) / 100;

        if (quantity > 0 && decision.action === 'BUY') {
          const trade = portfolioManager.executeTrade(decision, priceData.price, quantity);
          if (trade) {
            console.log('Trade executed:', trade);
          }
        } else if (decision.action === 'SELL') {
          const position = portfolio.positions.find(p => p.symbol === symbol);
          if (position) {
            const trade = portfolioManager.executeTrade(decision, priceData.price, position.quantity);
            if (trade) {
              console.log('Position closed:', trade);
            }
          }
        }
      }
    }

    portfolioManager.updatePositions(currentPrices);
    setPortfolio(portfolioManager.getPortfolio());
    setDecisions(newDecisions);
    setAiReports(prev => [...newReports, ...prev].slice(0, 50));
    setIsAnalyzing(false);
  }, [prices, priceHistory, isEnabled, aiConfig, portfolio.cash, portfolio.positions, isAnalyzing]);

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