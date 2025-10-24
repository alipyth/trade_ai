import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Portfolio, AIDecision } from '@/types/trading';
import { TrendingUp, TrendingDown, Activity, RotateCcw, FileText, Loader2 } from 'lucide-react';

interface TradingDashboardProps {
  portfolio: Portfolio;
  decisions: AIDecision[];
  aiReports: Array<{
    timestamp: number;
    symbol: string;
    analysis: string;
    decision: string;
  }>;
  isEnabled: boolean;
  isAnalyzing: boolean;
  onToggle: (enabled: boolean) => void;
  onReset: () => void;
}

const TradingDashboard = ({ 
  portfolio, 
  decisions, 
  aiReports,
  isEnabled,
  isAnalyzing,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Portfolio & Positions */}
      <div className="lg:col-span-2 space-y-6">
        {/* Portfolio Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Portfolio
              </CardTitle>
              <div className="flex items-center gap-3">
                <Switch checked={isEnabled} onCheckedChange={onToggle} />
                <Badge variant={isEnabled ? 'default' : 'secondary'}>
                  {isEnabled ? 'Active' : 'Paused'}
                </Badge>
                {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                <Button variant="outline" size="sm" onClick={onReset}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cash</p>
                <p className="text-xl font-bold">{formatCurrency(portfolio.cash)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Return</p>
                <p className={`text-xl font-bold ${portfolio.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(portfolio.totalReturn)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Positions</p>
                <p className="text-xl font-bold">{portfolio.positions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Positions */}
        {portfolio.positions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Open Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {portfolio.positions.map((position, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-bold">{position.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {position.quantity} @ {formatCurrency(position.entryPrice)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${position.unrealizedPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(position.unrealizedPnl)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(position.currentPrice)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Recent Trades */}
        {portfolio.trades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[250px]">
                <div className="space-y-2">
                  {portfolio.trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {trade.type === 'BUY' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <div>
                          <p className="font-bold text-sm">{trade.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {trade.quantity} @ {formatCurrency(trade.price)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(trade.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs">
                          {(trade.confidence * 100).toFixed(0)}% conf
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column - AI Analysis & Reports */}
      <div className="space-y-6">
        {/* Current AI Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {decisions.map((decision, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{decision.symbol}</span>
                      <Badge 
                        variant={
                          decision.action === 'BUY' ? 'default' : 
                          decision.action === 'SELL' ? 'destructive' : 
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {decision.action}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{decision.reasoning}</p>
                    <p className="text-xs font-medium">
                      Confidence: {(decision.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* AI Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-4 h-4" />
              AI Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {aiReports.map((report, index) => (
                  <div key={index} className="p-3 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{report.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {report.decision}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{report.analysis}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TradingDashboard;