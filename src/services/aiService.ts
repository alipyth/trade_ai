export type AIProvider = 'openai' | 'openrouter' | 'ollama';

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseURL?: string;
}

export interface MarketAnalysis {
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  chainOfThought: string;
  stopLoss?: number;
  takeProfit?: number;
  invalidationCondition?: string;
}

export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  async analyzeMarket(
    symbol: string,
    price: number,
    indicators: {
      rsi7: number;
      rsi14: number;
      macd: number;
      ema20: number;
      priceHistory: number[];
      emaHistory: number[];
      macdHistory: number[];
      rsiHistory: number[];
    },
    currentPositions: any[],
    portfolioValue: number,
    availableCash: number
  ): Promise<MarketAnalysis> {
    const prompt = this.buildProfessionalPrompt(
      symbol,
      price,
      indicators,
      currentPositions,
      portfolioValue,
      availableCash
    );

    try {
      const response = await this.callAI(prompt);
      return this.parseResponse(response, price);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(indicators, price);
    }
  }

  private buildProfessionalPrompt(
    symbol: string,
    price: number,
    indicators: any,
    positions: any[],
    portfolioValue: number,
    cash: number
  ): string {
    const currentPosition = positions.find(p => p.symbol === symbol);
    
    return `You are a professional crypto trader analyzing ${symbol}. Provide a detailed trading decision.

CURRENT MARKET STATE FOR ${symbol}
Current Price: $${price}
Current EMA(20): $${indicators.ema20}
Current MACD: ${indicators.macd.toFixed(3)}
Current RSI(7): ${indicators.rsi7.toFixed(2)}
Current RSI(14): ${indicators.rsi14.toFixed(2)}

Intraday Price History (oldest → newest):
${indicators.priceHistory.slice(-10).map((p: number) => p.toFixed(2)).join(', ')}

EMA(20) History:
${indicators.emaHistory.slice(-10).map((e: number) => e.toFixed(2)).join(', ')}

MACD History:
${indicators.macdHistory.slice(-10).map((m: number) => m.toFixed(3)).join(', ')}

RSI(7) History:
${indicators.rsiHistory.slice(-10).map((r: number) => r.toFixed(2)).join(', ')}

YOUR ACCOUNT INFORMATION
Portfolio Value: $${portfolioValue.toFixed(2)}
Available Cash: $${cash.toFixed(2)}

${currentPosition ? `
CURRENT POSITION IN ${symbol}:
Quantity: ${currentPosition.quantity}
Entry Price: $${currentPosition.entryPrice}
Current Price: $${price}
Unrealized P&L: $${currentPosition.unrealizedPnl.toFixed(2)}
Stop Loss: $${currentPosition.stopLoss || 'Not set'}
Take Profit: $${currentPosition.takeProfit || 'Not set'}
` : 'No current position in this asset.'}

INSTRUCTIONS:
1. Analyze the technical indicators (EMA, MACD, RSI)
2. Consider the trend direction and momentum
3. Evaluate risk/reward ratio
4. Provide your decision: BUY, SELL, or HOLD

Respond in this EXACT JSON format:
{
  "chainOfThought": "Your detailed analysis process here. Explain what you see in the data, why you're making this decision, and what conditions would invalidate your thesis.",
  "decision": "BUY|SELL|HOLD",
  "confidence": 0.0-1.0,
  "reasoning": "Brief summary of your decision",
  "stopLoss": price_number,
  "takeProfit": price_number,
  "invalidationCondition": "What would make you exit this trade"
}`;
  }

  private async callAI(prompt: string): Promise<string> {
    const { provider, apiKey, model, baseURL } = this.config;

    if (provider === 'ollama') {
      return this.callOllama(prompt, model || 'llama2');
    }

    if (!apiKey) {
      throw new Error('API key required for this provider');
    }

    const url = baseURL || (provider === 'openrouter' 
      ? 'https://openrouter.ai/api/v1/chat/completions'
      : 'https://api.openai.com/v1/chat/completions');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'openrouter' ? {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Crypto Trading Bot'
        } : {})
      },
      body: JSON.stringify({
        model: model || (provider === 'openrouter' ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo'),
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional crypto trading analyst with expertise in technical analysis. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callOllama(prompt: string, model: string): Promise<string> {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama API error');
    }

    const data = await response.json();
    return data.response;
  }

  private parseResponse(response: string, currentPrice: number): MarketAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          decision: parsed.decision || 'HOLD',
          confidence: parsed.confidence || 0.5,
          reasoning: parsed.reasoning || 'AI analysis',
          chainOfThought: parsed.chainOfThought || 'No detailed analysis provided',
          stopLoss: parsed.stopLoss,
          takeProfit: parsed.takeProfit,
          invalidationCondition: parsed.invalidationCondition
        };
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
    }

    return this.fallbackAnalysis({ rsi7: 50, rsi14: 50, macd: 0, ema20: currentPrice }, currentPrice);
  }

  private fallbackAnalysis(
    indicators: { rsi7: number; rsi14: number; macd: number; ema20: number },
    price: number
  ): MarketAnalysis {
    const { rsi7, rsi14, macd, ema20 } = indicators;
    
    if (rsi7 < 30 && macd > 0 && price > ema20) {
      return {
        decision: 'BUY',
        confidence: 0.75,
        reasoning: 'RSI oversold with bullish MACD and price above EMA',
        chainOfThought: 'Technical analysis shows oversold conditions (RSI < 30) combined with bullish momentum (MACD > 0) and price trading above the 20-period EMA, suggesting a potential reversal.',
        stopLoss: price * 0.98,
        takeProfit: price * 1.04,
        invalidationCondition: 'Price closes below EMA20'
      };
    }
    
    if (rsi7 > 70 && macd < 0 && price < ema20) {
      return {
        decision: 'SELL',
        confidence: 0.75,
        reasoning: 'RSI overbought with bearish MACD and price below EMA',
        chainOfThought: 'Market showing overbought conditions (RSI > 70) with bearish momentum (MACD < 0) and price below EMA20, indicating potential downside.',
        invalidationCondition: 'Price closes above EMA20'
      };
    }

    return {
      decision: 'HOLD',
      confidence: 0.5,
      reasoning: 'No clear trading signal',
      chainOfThought: 'Current market conditions do not present a clear trading opportunity. RSI is neutral, MACD shows mixed signals. Best to wait for clearer setup.',
      invalidationCondition: 'N/A'
    };
  }
}