import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIConfig, AIProvider } from '@/services/aiService';
import { Brain } from 'lucide-react';

interface AIConfigPanelProps {
  config: AIConfig;
  onChange: (config: AIConfig) => void;
}

const AIConfigPanel = ({ config, onChange }: AIConfigPanelProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>AI Provider</Label>
          <Select
            value={config.provider}
            onValueChange={(value: AIProvider) => onChange({ ...config, provider: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="ollama">Ollama (Local)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.provider !== 'ollama' && (
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input
              type="password"
              placeholder="Enter your API key"
              value={config.apiKey || ''}
              onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Model</Label>
          <Input
            placeholder={
              config.provider === 'openai' ? 'gpt-3.5-turbo' :
              config.provider === 'openrouter' ? 'openai/gpt-3.5-turbo' :
              'llama2'
            }
            value={config.model || ''}
            onChange={(e) => onChange({ ...config, model: e.target.value })}
          />
        </div>

        {config.provider === 'ollama' && (
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input
              placeholder="http://localhost:11434"
              value={config.baseURL || ''}
              onChange={(e) => onChange({ ...config, baseURL: e.target.value })}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIConfigPanel;