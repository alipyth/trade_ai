import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ExchangeConfig, ExchangeType, TradingMode } from '@/types/exchange';
import { Building2, AlertCircle, Shield, Zap } from 'lucide-react';

interface ExchangeConfigPanelProps {
  config: ExchangeConfig;
  onChange: (config: ExchangeConfig) => void;
}

const ExchangeConfigPanel = ({ config, onChange }: ExchangeConfigPanelProps) => {
  const isLiveMode = config.mode === 'live';
  const hasCredentials = config.credentials?.apiKey && config.credentials?.apiSecret;

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Building2 className="w-5 h-5" />
          تنظیمات صرافی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trading Mode */}
        <div className="space-y-3">
          <Label className="text-right block text-base font-semibold">حالت معاملاتی</Label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => onChange({ ...config, mode: 'demo' })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                config.mode === 'demo'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span className="font-bold">حالت آزمایشی</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                معامله با پول مجازی - بدون ریسک
              </p>
              {config.mode === 'demo' && (
                <Badge className="mt-2" variant="default">فعال</Badge>
              )}
            </div>

            <div
              onClick={() => onChange({ ...config, mode: 'live' })}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                config.mode === 'live'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-bold">حالت واقعی</span>
              </div>
              <p className="text-xs text-muted-foreground text-right">
                معامله با پول واقعی - نیاز به API
              </p>
              {config.mode === 'live' && (
                <Badge className="mt-2" variant="default">فعال</Badge>
              )}
            </div>
          </div>
        </div>

        {isLiveMode && !hasCredentials && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              برای معامله واقعی، باید کلیدهای API صرافی را وارد کنید.
            </AlertDescription>
          </Alert>
        )}

        {/* Exchange Selection */}
        <div className="space-y-2">
          <Label className="text-right block">انتخاب صرافی</Label>
          <Select
            value={config.type}
            onValueChange={(value: ExchangeType) => onChange({ ...config, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binance">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  بایننس (Binance)
                </div>
              </SelectItem>
              <SelectItem value="bybit">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  بای‌بیت (Bybit)
                </div>
              </SelectItem>
              <SelectItem value="okx">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  او‌کی‌ایکس (OKX)
                </div>
              </SelectItem>
              <SelectItem value="kucoin">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  کوکوین (KuCoin)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* API Credentials - Only for Live Mode */}
        {isLiveMode && (
          <>
            <div className="space-y-2">
              <Label className="text-right block">کلید API (API Key)</Label>
              <Input
                type="password"
                placeholder="کلید API خود را وارد کنید"
                value={config.credentials?.apiKey || ''}
                onChange={(e) =>
                  onChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      apiKey: e.target.value,
                      apiSecret: config.credentials?.apiSecret || '',
                    },
                  })
                }
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-right block">کلید محرمانه (Secret Key)</Label>
              <Input
                type="password"
                placeholder="کلید محرمانه خود را وارد کنید"
                value={config.credentials?.apiSecret || ''}
                onChange={(e) =>
                  onChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      apiKey: config.credentials?.apiKey || '',
                      apiSecret: e.target.value,
                    },
                  })
                }
                className="text-right"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-right">استفاده از Testnet (شبکه آزمایشی)</Label>
              <Switch
                checked={config.credentials?.testnet || false}
                onCheckedChange={(checked) =>
                  onChange({
                    ...config,
                    credentials: {
                      ...config.credentials,
                      apiKey: config.credentials?.apiKey || '',
                      apiSecret: config.credentials?.apiSecret || '',
                      testnet: checked,
                    },
                  })
                }
              />
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 space-y-2 text-right">
          <p className="font-medium">راهنما:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            {config.mode === 'demo' ? (
              <>
                <li>در حالت آزمایشی با پول مجازی معامله می‌کنید</li>
                <li>هیچ ریسک مالی وجود ندارد</li>
                <li>برای یادگیری و تست استراتژی مناسب است</li>
              </>
            ) : (
              <>
                <li>کلیدهای API را از پنل صرافی خود دریافت کنید</li>
                <li>حتماً مجوزهای لازم (خواندن و معامله) را فعال کنید</li>
                <li>برای امنیت بیشتر، ابتدا از Testnet استفاده کنید</li>
                <li>هرگز کلیدهای API خود را با دیگران به اشتراک نگذارید</li>
                <li>توصیه می‌شود IP Whitelist را فعال کنید</li>
              </>
            )}
          </ul>
        </div>

        {/* Warning for Live Mode */}
        {isLiveMode && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              <strong>هشدار:</strong> در حالت واقعی، معاملات با پول واقعی انجام می‌شود. لطفاً با احتیاط عمل کنید و ابتدا استراتژی خود را در حالت آزمایشی تست کنید.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeConfigPanel;