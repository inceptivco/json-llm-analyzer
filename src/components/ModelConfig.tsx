import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export type ModelProvider = 'openai' | 'anthropic';
export type ModelType = 
  | 'gpt-4'
  | 'gpt-3.5-turbo'
  | 'gpt-4-turbo-preview'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-3.5-turbo-preview'
  | 'o1-preview'
  | 'o1-mini'
  | 'claude-3-opus-20240229'
  | 'claude-3-sonnet-20240229'
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-5-haiku-latest';

  interface ModelConfigProps {
    provider: ModelProvider;
    model: ModelType;
    onProviderChange: (provider: ModelProvider) => void;
    onModelChange: (model: ModelType) => void;
    onApiKeyChange: (apiKey: string) => void;
  }
  
  const PROVIDER_OPTIONS: { value: ModelProvider; label: string }[] = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
  ];
  
  const MODEL_OPTIONS: Record<ModelProvider, { value: ModelType; label: string }[]> = {
    openai: [
      { value: 'gpt-4', label: 'GPT-4' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo Preview' },
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { value: 'gpt-3.5-turbo-preview', label: 'GPT-3.5 Turbo Preview' },
      { value: 'o1-preview', label: 'O1 Preview' },
      { value: 'o1-mini', label: 'O1 Mini' },
    ],
    anthropic: [
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku' },
    ],
  };
  
  export function ModelConfig({ 
    provider, 
    model, 
    onProviderChange, 
    onModelChange,
    onApiKeyChange 
  }: ModelConfigProps) {
    const [showApiKey, setShowApiKey] = useState(false);
  
    const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onApiKeyChange(event.target.value);
    };
  
    const getApiKeyPlaceholder = () => {
      return provider === 'openai' ? 'Enter OpenAI API Key' : 'Enter Anthropic API Key';
    };
  
    const toggleShowApiKey = () => {
      setShowApiKey(!showApiKey);
    };
  
    return (
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>AI Provider</Label>
              <Select
                value={provider}
                onValueChange={(value: ModelProvider) => onProviderChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label>Model</Label>
              <Select
                value={model}
                onValueChange={(value: ModelType) => onModelChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  {MODEL_OPTIONS[provider].map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex gap-2">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder={getApiKeyPlaceholder()}
                  onChange={handleApiKeyChange}
                  defaultValue={localStorage.getItem('ai-api-key') || ''}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleShowApiKey}
                  type="button"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
       