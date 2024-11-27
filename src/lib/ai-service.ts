import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, ModelType } from '@/components/ModelConfig';

export class AIServiceFactory {
    private static instance: AIServiceFactory;
    private provider: ModelProvider | null = null;
    private model: ModelType | null = null;
    private apiKey: string | null = null;
    private client: any = null;
    private isInitialized = false;
  
    private constructor() {}
  
    static getInstance(): AIServiceFactory {
      if (!AIServiceFactory.instance) {
        AIServiceFactory.instance = new AIServiceFactory();
      }
      return AIServiceFactory.instance;
    }
  
    configure(provider: ModelProvider, model: ModelType, apiKey: string): boolean {
      if (!apiKey) {
        console.error('API key is required');
        return false;
      }
  
      try {
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
        
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Failed to configure AI service:', error);
        this.isInitialized = false;
        return false;
      }
    }
  
    getClient() {
      if (!this.isConfigured()) {
        throw new Error('AI service not properly configured. Please check your API key and settings.');
      }
      return this.client;
    }

    getModel() {
      if (!this.isConfigured()) {
        throw new Error('AI service not properly configured. Please check your API key and settings.');
      }
      return this.model;
    }
    isConfigured(): boolean {
        return this.isInitialized && 
               !!this.apiKey && 
               !!this.client && 
               !!this.provider && 
               !!this.model;
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