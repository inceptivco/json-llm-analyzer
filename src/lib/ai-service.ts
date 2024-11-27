import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, ModelType } from '@/components/ModelConfig';

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private provider: ModelProvider = 'openai';
  private model: ModelType = 'gpt-4';
  private apiKey: string = '';
  private client: any;

  private constructor() {}

  static getInstance(): AIServiceFactory {
    if (!AIServiceFactory.instance) {
      AIServiceFactory.instance = new AIServiceFactory();
    }
    return AIServiceFactory.instance;
  }

  configure(provider: ModelProvider, model: ModelType, apiKey: string) {
    this.provider = provider;
    this.model = model;
    this.apiKey = apiKey;
    
    switch (provider) {
      case 'openai':
        this.client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
        break;
      case 'anthropic':
        this.client = new Anthropic({ apiKey });
        break;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('AI service not configured');
    }
    return this.client;
  }

  async createCompletion(messages: any[], options: any = {}) {
    const client = this.getClient();
    
    switch (this.provider) {
      case 'openai':
        return client.chat.completions.create({
          ...options,
          messages,
          model: this.model
        });
      case 'anthropic':
        return client.messages.create({
          ...options,
          messages,
          model: this.model,
          max_tokens: options.max_tokens || 4096
        });
      default:
        throw new Error('Unsupported provider');
    }
  }
}