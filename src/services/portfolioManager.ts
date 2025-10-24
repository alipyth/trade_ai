import { Portfolio, Position, Trade, AIDecision } from '@/types/trading';

export class PortfolioManager {
  private portfolio: Portfolio;
  private readonly INITIAL_CASH = 10000;

  constructor() {
    const savedPortfolio = localStorage.getItem('trading-portfolio');
    if (savedPortfolio) {
      this.portfolio = JSON.parse(savedPortfolio);
    } else {
      this.portfolio = {
        cash: this.INITIAL_CASH,
        totalValue: this.INITIAL_CASH,
        positions: [],
        trades: [],
        totalReturn: 0,
      };
    }
  }

  getPortfolio(): Portfolio {
    return { ...this.portfolio };
  }

  executeTrade(decision: AIDecision, currentPrice: number, quantity: number): Trade | null {
    if (decision.action === 'HOLD') return null;

    const trade: Trade = {
      id: Date.now().toString(),
      symbol: decision.symbol,
      type: decision.action,
      quantity,
      price: currentPrice,
      timestamp: Date.now(),
      reason: decision.reasoning,
      confidence: decision.confidence,
    };

    if (decision.action === 'BUY') {
      const cost = quantity * currentPrice;
      if (cost > this.portfolio.cash) {
        console.warn('Insufficient funds');
        return null;
      }

      this.portfolio.cash -= cost;
      
      const existingPosition = this.portfolio.positions.find(p => p.symbol === decision.symbol);
      if (existingPosition) {
        const totalQuantity = existingPosition.quantity + quantity;
        const avgPrice = (existingPosition.entryPrice * existingPosition.quantity + currentPrice * quantity) / totalQuantity;
        existingPosition.quantity = totalQuantity;
        existingPosition.entryPrice = avgPrice;
        existingPosition.currentPrice = currentPrice;
        existingPosition.stopLoss = decision.stopLoss;
        existingPosition.takeProfit = decision.takeProfit;
      } else {
        this.portfolio.positions.push({
          symbol: decision.symbol,
          quantity,
          entryPrice: currentPrice,
          currentPrice,
          leverage: 1,
          unrealizedPnl: 0,
          entryTime: Date.now(),
          stopLoss: decision.stopLoss,
          takeProfit: decision.takeProfit,
        });
      }
    } else if (decision.action === 'SELL') {
      const positionIndex = this.portfolio.positions.findIndex(p => p.symbol === decision.symbol);
      if (positionIndex === -1) {
        console.warn('No position to sell');
        return null;
      }

      const position = this.portfolio.positions[positionIndex];
      const sellQuantity = Math.min(quantity, position.quantity);
      const proceeds = sellQuantity * currentPrice;
      const pnl = (currentPrice - position.entryPrice) * sellQuantity;

      this.portfolio.cash += proceeds;
      position.quantity -= sellQuantity;

      if (position.quantity <= 0) {
        this.portfolio.positions.splice(positionIndex, 1);
      }

      trade.quantity = sellQuantity;
    }

    this.portfolio.trades.unshift(trade);
    this.savePortfolio();
    return trade;
  }

  updatePositions(prices: Record<string, number>): void {
    let totalPositionValue = 0;

    this.portfolio.positions.forEach(position => {
      const currentPrice = prices[position.symbol];
      if (currentPrice) {
        position.currentPrice = currentPrice;
        position.unrealizedPnl = (currentPrice - position.entryPrice) * position.quantity;
        totalPositionValue += currentPrice * position.quantity;

        // Check stop loss and take profit
        if (position.stopLoss && currentPrice <= position.stopLoss) {
          console.log(`Stop loss hit for ${position.symbol}`);
        }
        if (position.takeProfit && currentPrice >= position.takeProfit) {
          console.log(`Take profit hit for ${position.symbol}`);
        }
      }
    });

    this.portfolio.totalValue = this.portfolio.cash + totalPositionValue;
    this.portfolio.totalReturn = ((this.portfolio.totalValue - this.INITIAL_CASH) / this.INITIAL_CASH) * 100;
    this.savePortfolio();
  }

  resetPortfolio(): void {
    this.portfolio = {
      cash: this.INITIAL_CASH,
      totalValue: this.INITIAL_CASH,
      positions: [],
      trades: [],
      totalReturn: 0,
    };
    this.savePortfolio();
  }

  private savePortfolio(): void {
    localStorage.setItem('trading-portfolio', JSON.stringify(this.portfolio));
  }
}