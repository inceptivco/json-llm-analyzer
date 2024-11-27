import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type ModelProvider = 'openai' | 'anthropic';
export type OpenAIModel = 'gpt-4' | 'gpt-4-turbo-preview' | 'gpt-3.5-turbo';
export type AnthropicModel = 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229' | 'claude-2.1';
export type ModelType = OpenAIModel | AnthropicModel;

interface ModelConfigProps {
  provider: ModelProvider;
  model: ModelType;
  onProviderChange: (provider: ModelProvider) => void;
  onModelChange: (model: ModelType) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export function ModelConfig({ 
  provider, 
  model, 
  onProviderChange, 
  onModelChange, 
  onApiKeyChange 
}: ModelConfigProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    onApiKeyChange(value);
  };

  const getModelOptions = () => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
          { value: 'gpt-3.5-turbo-preview', label: 'GPT-3.5 Turbo' },
          { value: 'o1-preview', label: 'o1-preview' },
          { value: 'o1-mini', label: 'o1-mini' },
          { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-5-sonnet-latest', label: 'claude-3-5-sonnet-latest' },
          { value: 'claude-3-5-haiku-latest', label: 'claude-3-5-haiku-latest' },
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Model Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Provider</label>
          <Select value={provider} onValueChange={(value) => onProviderChange(value as ModelProvider)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Model</label>
          <Select value={model} onValueChange={(value) => onModelChange(value as ModelType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getModelOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">API Key</label>
          <div className="flex gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="Enter API key"
              className="font-mono"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}