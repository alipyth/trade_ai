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
  stopLoss?: number;
  takeProfit?: number;
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
    }
  ): Promise<MarketAnalysis> {
    const prompt = this.buildPrompt(symbol, price, indicators);

    try {
      const response = await this.callAI(prompt);
      return this.parseResponse(response, price);
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(indicators, price);
    }
  }

  private buildPrompt(
    symbol: string,
    price: number,
    indicators: { rsi7: number; rsi14: number; macd: number; ema20: number }
  ): string {
    return `You are a professional crypto trader. Analyze ${symbol} and provide a trading decision.

Current Price: $${price}
EMA(20): $${indicators.ema20}
MACD: ${indicators.macd}
RSI(7): ${indicators.rsi7}
RSI(14): ${indicators.rsi14}

Based on these technical indicators, should I BUY, SELL, or HOLD?
Provide your response in JSON format:
{
  "decision": "BUY|SELL|HOLD",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "stopLoss": price (optional),
  "takeProfit": price (optional)
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
          { role: 'system', content: 'You are a professional crypto trading analyst.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
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
          stopLoss: parsed.stopLoss,
          takeProfit: parsed.takeProfit
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
        stopLoss: price * 0.98,
        takeProfit: price * 1.04
      };
    }
    
    if (rsi7 > 70 && macd < 0 && price < ema20) {
      return {
        decision: 'SELL',
        confidence: 0.75,
        reasoning: 'RSI overbought with bearish MACD and price below EMA'
      };
    }

    return {
      decision: 'HOLD',
      confidence: 0.5,
      reasoning: 'No clear trading signal'
    };
  }
}