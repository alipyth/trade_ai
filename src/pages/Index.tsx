import { useState } from 'react';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';
import { useTradingBot } from '@/hooks/useTradingBot';
import CryptoCard from '@/components/CryptoCard';
import CryptoChart from '@/components/CryptoChart';
import TradingDashboard from '@/components/TradingDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw } from 'lucide-react';
import { MadeWithDyad } from '@/components/made-with-dyad';

const Index = () => {
  const { prices, priceHistory, isLoading, error } = useCryptoPrices();
  const [isBotEnabled, setIsBotEnabled] = useState(false);
  const { portfolio, decisions, lastTrade, resetPortfolio } = useTradingBot(prices, isBotEnabled);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-xl text-gray-600">Loading crypto prices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const cryptoSymbols = prices ? Object.keys(prices.prices) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" style={{ animationDuration: '3s' }} />
            AI Crypto Trading Bot
          </h1>
          <p className="text-gray-600 text-lg">Real-time cryptocurrency trading with AI</p>
        </div>

        <Tabs defaultValue="trading" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trading">Trading Dashboard</TabsTrigger>
            <TabsTrigger value="market">Market Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-6">
            <TradingDashboard
              portfolio={portfolio}
              decisions={decisions}
              lastTrade={lastTrade}
              isEnabled={isBotEnabled}
              onToggle={setIsBotEnabled}
              onReset={resetPortfolio}
            />
          </TabsContent>

          <TabsContent value="market" className="space-y-6">
            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </Tabs>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;