import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Portfolio, AIDecision, Trade } from '@/types/trading';
import { TrendingUp, TrendingDown, DollarSign, Activity, RotateCcw } from 'lucide-react';

interface TradingDashboardProps {
  portfolio: Portfolio;
  decisions: AIDecision[];
  lastTrade: Trade | null;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onReset: () => void;
}

const TradingDashboard = ({ 
  portfolio, 
  decisions, 
  lastTrade, 
  isEnabled, 
  onToggle,
  onReset 
}: TradingDashboardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              AI Trading Bot
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm">Bot Status:</span>
                <Switch checked={isEnabled} onCheckedChange={onToggle} />
                <Badge variant={isEnabled ? 'default' : 'secondary'}>
                  {isEnabled ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={onReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Available Cash</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Return</p>
              <p className={`text-2xl font-bold ${portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(portfolio.totalReturn)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Open Positions</p>
              <p className="text-2xl font-bold">{portfolio.positions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Positions */}
      {portfolio.positions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.positions.map((position, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold">{position.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.quantity} @ {formatCurrency(position.entryPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(position.unrealizedPnl)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current: {formatCurrency(position.currentPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Decisions */}
      <Card>
        <CardHeader>
          <CardTitle>AI Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {decisions.map((decision, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={
                      decision.action === 'BUY' ? 'default' : 
                      decision.action === 'SELL' ? 'destructive' : 
                      'secondary'
                    }
                  >
                    {decision.action}
                  </Badge>
                  <div>
                    <p className="font-bold">{decision.symbol}</p>
                    <p className="text-sm text-muted-foreground">{decision.reasoning}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    Confidence: {(decision.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      {portfolio.trades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {portfolio.trades.slice(0, 10).map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {trade.type === 'BUY' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-bold">{trade.symbol}</p>
                      <p className="text-sm text-muted-foreground">
                        {trade.quantity} @ {formatCurrency(trade.price)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{trade.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: {(trade.confidence * 100).toFixed(0)}%
                    </p>
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

export default TradingDashboard;