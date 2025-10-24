import { useState } from 'react';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useTradingBot } from '@/hooks/useTradingBot';
import CryptoCard from '@/components/CryptoCard';
import CryptoChart from '@/components/CryptoChart';
import TradingDashboard from '@/components/TradingDashboard';
import AIConfigPanel from '@/components/AIConfigPanel';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Bot } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { AIConfig } from '@/services/aiService';

const Index = () => {
  const { prices, priceHistory, isLoading, error } = useCryptoPrices();
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo'
  });

  const { portfolio, decisions, aiReports, isAnalyzing, resetPortfolio } = useTradingBot(
    prices,
    priceHistory,
    isBotEnabled,
    aiConfig
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const cryptoSymbols = prices ? Object.keys(prices.prices) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-600" />
            AI Crypto Trading Bot
          </h1>
          <p className="text-gray-600">Automated trading with AI analysis</p>
        </div>

        <Tabs defaultValue="trading" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
          </TabsList>

          <TabsContent value="trading">
            <TradingDashboard
              portfolio={portfolio}
              decisions={decisions}
              aiReports={aiReports}
              isEnabled={isBotEnabled}
              isAnalyzing={isAnalyzing}
              onToggle={setIsBotEnabled}
              onReset={resetPortfolio}
            />
          </TabsContent>

          <TabsContent value="market" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prices && cryptoSymbols.map((symbol) => {
                const crypto = prices.prices[symbol];
                const history = priceHistory[symbol] || [];
                const previousPrice = history.length > 1 ? history[history.length - 2].price : undefined;
                
                return (
                  <CryptoCard 
                    key={symbol} 
                    crypto={crypto} 
                    previousPrice={previousPrice}
                  />
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cryptoSymbols.map((symbol) => {
                const history = priceHistory[symbol] || [];
                if (history.length < 2) return null;
                
                return (
                  <CryptoChart 
                    key={symbol} 
                    symbol={symbol} 
                    data={history}
                  />
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="config">
            <div className="max-w-2xl">
              <AIConfigPanel config={aiConfig} onChange={setAiConfig} />
            </div>
          </TabsContent>
        </Tabs>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;