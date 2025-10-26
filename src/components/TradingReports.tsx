import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Portfolio } from '@/types/trading';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Clock,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react';

interface TradingReportsProps {
  portfolio: Portfolio;
  aiReports: Array<{
    timestamp: number;
    symbol: string;
    analysis: string;
    chainOfThought: string;
    decision: string;
    confidence: number;
  }>;
}

const TradingReports = ({ portfolio, aiReports }: TradingReportsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fa-IR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate statistics
  const totalTrades = portfolio.trades.length;
  const buyTrades = portfolio.trades.filter(t => t.type === 'BUY').length;
  const sellTrades = portfolio.trades.filter(t => t.type === 'SELL').length;
  const totalPnL = portfolio.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  const winningTrades = portfolio.trades.filter(t => {
    if (t.type === 'SELL') {
      const buyTrade = portfolio.trades.find(bt => 
        bt.symbol === t.symbol && 
        bt.type === 'BUY' && 
        bt.timestamp < t.timestamp
      );
      if (buyTrade) {
        return t.price > buyTrade.price;
      }
    }
    return false;
  }).length;

  const winRate = sellTrades > 0 ? (winningTrades / sellTrades) * 100 : 0;

  // Group trades by symbol
  const tradesBySymbol = portfolio.trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = [];
    }
    acc[trade.symbol].push(trade);
    return acc;
  }, {} as Record<string, typeof portfolio.trades>);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-right">
              <Activity className="w-4 h-4 text-blue-600" />
              کل معاملات
            </CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{totalTrades}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {buyTrades} خرید / {sellTrades} فروش
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-right">
              <Target className="w-4 h-4 text-green-600" />
              نرخ موفقیت
            </CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              {winningTrades} معامله سودده
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-right">
              <DollarSign className="w-4 h-4 text-purple-600" />
              سود/زیان کل
            </CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${formatCurrency(totalPnL)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              از پوزیشن‌های باز
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-right">
              <BarChart3 className="w-4 h-4 text-orange-600" />
              بازدهی کل
            </CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className={`text-2xl font-bold ${portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(portfolio.totalReturn)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ارزش پرتفوی: ${formatCurrency(portfolio.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade History by Symbol */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Activity className="w-5 h-5" />
              تاریخچه معاملات به تفکیک ارز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {Object.entries(tradesBySymbol).map(([symbol, trades]) => (
                  <div key={symbol} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{symbol}</h3>
                      <Badge variant="outline">{trades.length} معامله</Badge>
                    </div>
                    <div className="space-y-2">
                      {trades.slice(0, 5).map((trade) => (
                        <div key={trade.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            {trade.type === 'BUY' ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">{trade.type === 'BUY' ? 'خرید' : 'فروش'}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${formatCurrency(trade.price)}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(trade.timestamp).toLocaleTimeString('fa-IR')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Analysis Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <Clock className="w-5 h-5" />
              تایم‌لاین تحلیل‌های هوش مصنوعی
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {aiReports.map((report, index) => (
                  <div key={index} className="border-r-4 border-blue-500 pr-4 pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-right">
                        <h4 className="font-bold text-sm">{report.symbol}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(report.timestamp)}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          report.decision === 'BUY' ? 'default' : 
                          report.decision === 'SELL' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {report.decision === 'BUY' ? 'خرید' : report.decision === 'SELL' ? 'فروش' : 'نگهداری'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-right">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">تحلیل:</p>
                        <p className="text-sm">{report.analysis}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">فرآیند تفکر:</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {report.chainOfThought}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          اطمینان: {(report.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Current Positions Detail */}
      {portfolio.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-right">
              <BarChart3 className="w-5 h-5" />
              جزئیات پوزیشن‌های باز
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.positions.map((position, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">{position.symbol}</h3>
                    <Badge variant={position.unrealizedPnl >= 0 ? 'default' : 'destructive'}>
                      {position.unrealizedPnl >= 0 ? 'سودده' : 'زیان‌ده'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground">مقدار</p>
                      <p className="font-medium">{position.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">قیمت ورود</p>
                      <p className="font-medium">${formatCurrency(position.entryPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">قیمت فعلی</p>
                      <p className="font-medium">${formatCurrency(position.currentPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">سود/زیان</p>
                      <p className={`font-bold ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${formatCurrency(position.unrealizedPnl)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    {position.stopLoss && (
                      <div className="text-right">
                        <p className="text-muted-foreground">حد ضرر</p>
                        <p className="font-medium text-red-600">${formatCurrency(position.stopLoss)}</p>
                      </div>
                    )}
                    {position.takeProfit && (
                      <div className="text-right">
                        <p className="text-muted-foreground">حد سود</p>
                        <p className="font-medium text-green-600">${formatCurrency(position.takeProfit)}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground text-right">
                    زمان ورود: {formatDate(position.entryTime)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TradingReports;