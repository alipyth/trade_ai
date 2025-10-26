import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { CryptoPrice } from '@/types/crypto';

interface CryptoCardProps {
  crypto: CryptoPrice;
  previousPrice?: number;
}

const CryptoCard = ({ crypto, previousPrice }: CryptoCardProps) => {
  const priceChange = previousPrice ? crypto.price - previousPrice : 0;
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;
  const isPositive = priceChange >= 0;

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    } else if (price < 100) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow" dir="rtl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-2xl font-bold">{crypto.symbol}</span>
          {previousPrice && (
            <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span className="text-sm font-medium">
                {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-right">
          <div className="text-3xl font-bold">{formatPrice(crypto.price)}</div>
          {previousPrice && (
            <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatPrice(Math.abs(priceChange))}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            به‌روزرسانی: {new Date(crypto.timestamp).toLocaleTimeString('fa-IR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CryptoCard;