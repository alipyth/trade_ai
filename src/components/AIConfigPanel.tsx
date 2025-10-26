import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIConfig, AIProvider } from '@/services/aiService';
import { Brain, AlertCircle } from 'lucide-react';

interface AIConfigPanelProps {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

const AIConfigPanel = ({ config, onChange }: AIConfigPanelProps) => {
  const hasApiKey = config.provider === 'ollama' || (config.apiKey && config.apiKey.length > 0);

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-right">
          <Brain className="w-5 h-5" />
          تنظیمات هوش مصنوعی
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasApiKey && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-right">
              برای استفاده از ربات معاملاتی، لطفاً کلید API را وارد کنید یا از Ollama استفاده کنید.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label className="text-right block">ارائه‌دهنده هوش مصنوعی</Label>
          <Select
            value={config.provider}
            onValueChange={(value: AIProvider) => onChange({ ...config, provider: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI (توصیه می‌شود)</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="ollama">Ollama (محلی - رایگان)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider !== 'ollama' && (
          <div className="space-y-2">
            <Label className="text-right block">کلید API</Label>
            <Input
              type="password"
              placeholder="کلید API خود را وارد کنید"
              value={config.apiKey || ''}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
              className="text-right"
            />
            <p className="text-xs text-muted-foreground text-right">
              {config.provider === 'openai' 
                ? 'کلید API را از platform.openai.com دریافت کنید'
                : 'کلید API را از openrouter.ai دریافت کنید'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-right block">مدل</Label>
          <Input
            placeholder={
              config.provider === 'openai' ? 'gpt-3.5-turbo' :
              config.provider === 'openrouter' ? 'openai/gpt-3.5-turbo' :
              'llama2'
            }
            value={config.model || ''}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
            className="text-right"
          />
          <p className="text-xs text-muted-foreground text-right">
            {config.provider === 'openai' && 'مدل پیشنهادی: gpt-3.5-turbo یا gpt-4'}
            {config.provider === 'openrouter' && 'مدل پیشنهادی: openai/gpt-3.5-turbo'}
            {config.provider === 'ollama' && 'مدل پیشنهادی: llama2 یا mistral'}
          </p>
        </div>

        {config.provider === 'ollama' && (
          <div className="space-y-2">
            <Label className="text-right block">آدرس پایه</Label>
            <Input
              placeholder="http://localhost:11434"
              value={config.baseURL || ''}
              onChange={(e) => onChange({ ...config, baseURL: e.target.value })}
              className="text-right"
            />
            <p className="text-xs text-muted-foreground text-right">
              مطمئن شوید که Ollama در حال اجرا است
            </p>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-900 space-y-2 text-right">
          <p className="font-medium">راهنما:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>برای OpenAI: کلید API از platform.openai.com دریافت کنید</li>
            <li>برای OpenRouter: کلید API از openrouter.ai دریافت کنید (ارزان‌تر)</li>
            <li>برای Ollama: ابتدا Ollama را روی سیستم خود نصب و اجرا کنید (رایگان)</li>
            <li>توصیه: برای شروع از OpenAI با مدل gpt-3.5-turbo استفاده کنید</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIConfigPanel;