import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TradingStrategy, DEFAULT_STRATEGIES } from '@/types/trading';
import { Target, TrendingUp, Zap, Activity } from 'lucide-react';

interface StrategySelectorProps {
  strategy: TradingStrategy;
  onChange: (strategy: TradingStrategy) => void;
}

const StrategySelector = ({ strategy, onChange }: StrategySelectorProps) => {
  const handlePresetChange = (preset: string) => {
    onChange(DEFAULT_STRATEGIES[preset]);
  };

  const handleCustomChange = (field: keyof TradingStrategy, value: any) => {
    onChange({ ...strategy, [field]: value });
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Target className="w-5 h-5" />
          استراتژی معاملاتی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Strategies */}
        <div className="space-y-2">
          <Label className="text-right block">استراتژی از پیش تعریف شده</Label>
          <Select onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب استراتژی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  محافظه‌کارانه (ریسک کم)
                </div>
              </SelectItem>
              <SelectItem value="moderate">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  متعادل (ریسک متوسط)
                </div>
              </SelectItem>
              <SelectItem value="aggressive">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  تهاجمی (ریسک بالا)
                </div>
              </SelectItem>
              <SelectItem value="scalper">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-red-600" />
                  اسکالپر (معاملات سریع)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-medium text-sm text-right">تنظیمات سفارشی</h3>
          
          {/* Risk Per Trade */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-right">ریسک هر معامله: {strategy.riskPerTrade}%</Label>
            </div>
            <Slider
              value={[strategy.riskPerTrade]}
              onValueChange={([value]) => handleCustomChange('riskPerTrade', value)}
              min={0.5}
              max={5}
              step={0.5}
            />
          </div>

          {/* Max Positions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-right">حداکثر پوزیشن همزمان: {strategy.maxPositions}</Label>
            </div>
            <Slider
              value={[strategy.maxPositions]}
              onValueChange={([value]) => handleCustomChange('maxPositions', value)}
              min={1}
              max={10}
              step={1}
            />
          </div>

          {/* Min Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-right">حداقل اطمینان: {(strategy.minConfidence * 100).toFixed(0)}%</Label>
            </div>
            <Slider
              value={[strategy.minConfidence * 100]}
              onValueChange={([value]) => handleCustomChange('minConfidence', value / 100)}
              min={50}
              max={90}
              step={5}
            />
          </div>

          {/* Max Leverage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-right">حداکثر لوریج: {strategy.maxLeverage}x</Label>
            </div>
            <Slider
              value={[strategy.maxLeverage]}
              onValueChange={([value]) => handleCustomChange('maxLeverage', value)}
              min={1}
              max={20}
              step={1}
            />
          </div>

          {/* Trailing Stop */}
          <div className="flex items-center justify-between">
            <Label className="text-right">حد ضرر متحرک</Label>
            <Switch
              checked={strategy.useTrailingStop}
              onCheckedChange={(checked) => handleCustomChange('useTrailingStop', checked)}
            />
          </div>

          {strategy.useTrailingStop && (
            <div className="space-y-2 mr-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-right">درصد حد ضرر متحرک: {strategy.trailingStopPercent}%</Label>
              </div>
              <Slider
                value={[strategy.trailingStopPercent]}
                onValueChange={([value]) => handleCustomChange('trailingStopPercent', value)}
                min={1}
                max={10}
                step={0.5}
              />
            </div>
          )}

          {/* DCA */}
          <div className="flex items-center justify-between">
            <Label className="text-right">میانگین‌گیری هزینه (DCA)</Label>
            <Switch
              checked={strategy.useDCA}
              onCheckedChange={(checked) => handleCustomChange('useDCA', checked)}
            />
          </div>

          {strategy.useDCA && (
            <div className="space-y-2 mr-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-right">تعداد سطوح DCA: {strategy.dcaLevels}</Label>
              </div>
              <Slider
                value={[strategy.dcaLevels]}
                onValueChange={([value]) => handleCustomChange('dcaLevels', value)}
                min={1}
                max={5}
                step={1}
              />
            </div>
          )}

          {/* Scalping */}
          <div className="flex items-center justify-between">
            <Label className="text-right">اسکالپینگ (معاملات سریع)</Label>
            <Switch
              checked={strategy.useScalping}
              onCheckedChange={(checked) => handleCustomChange('useScalping', checked)}
            />
          </div>

          {strategy.useScalping && (
            <div className="space-y-2 mr-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-right">هدف سود اسکالپینگ: {strategy.scalpingTargetPercent}%</Label>
              </div>
              <Slider
                value={[strategy.scalpingTargetPercent]}
                onValueChange={([value]) => handleCustomChange('scalpingTargetPercent', value)}
                min={0.5}
                max={3}
                step={0.1}
              />
            </div>
          )}

          {/* Diversification */}
          <div className="flex items-center justify-between">
            <Label className="text-right">تنوع‌بخشی پرتفوی</Label>
            <Switch
              checked={strategy.diversification}
              onCheckedChange={(checked) => handleCustomChange('diversification', checked)}
            />
          </div>

          {/* Market Timing */}
          <div className="flex items-center justify-between">
            <Label className="text-right">زمان‌بندی بازار</Label>
            <Switch
              checked={strategy.useMarketTiming}
              onCheckedChange={(checked) => handleCustomChange('useMarketTiming', checked)}
            />
          </div>

          {strategy.useMarketTiming && (
            <div className="flex items-center justify-between mr-4">
              <Label className="text-sm text-right">اجتناب از آخر هفته</Label>
              <Switch
                checked={strategy.avoidWeekends}
                onCheckedChange={(checked) => handleCustomChange('avoidWeekends', checked)}
              />
            </div>
          )}
        </div>

        {/* Strategy Info */}
        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 space-y-2 text-right">
          <p className="font-medium">استراتژی فعلی: {strategy.name}</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>ریسک هر معامله: {strategy.riskPerTrade}%</li>
            <li>حداکثر پوزیشن: {strategy.maxPositions}</li>
            <li>حداقل اطمینان: {(strategy.minConfidence * 100).toFixed(0)}%</li>
            <li>حداکثر لوریج: {strategy.maxLeverage}x</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StrategySelector;