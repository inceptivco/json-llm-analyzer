import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { ModelProvider, ModelType } from '@/components/ModelConfig';
import { ANALYSIS_PROMPT, UPDATE_JSON_PROMPT } from './prompts';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionOptions {
  temperature?: number;
  max_tokens?: number;
  [key: string]: any;
}

export class AIServiceFactory {
  private static instance: AIServiceFactory;
  private provider: ModelProvider | null = null;
  private model: ModelType | null = null;
  private apiKey: string | null = null;
  private client: OpenAI | Anthropic | null = null;
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
          this.client = new OpenAI({ 
            apiKey, 
            dangerouslyAllowBrowser: true 
          });
          break;
        case 'anthropic':
          this.client = new Anthropic({ 
            apiKey, 
            dangerouslyAllowBrowser: true 
          });
          break;
        default:
          throw new Error('Unsupported provider');
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to configure AI service:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async createCompletion(messages: Message[], options: CompletionOptions = {}) {
    if (!this.isConfigured()) {
      throw new Error('AI service not properly configured');
    }

    try {
      switch (this.provider) {
        case 'openai': {
          const response = await (this.client as OpenAI).chat.completions.create({
            model: this.model as string,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.max_tokens,
            ...options
          });

          return {
            choices: [{
              message: {
                content: response.choices[0].message.content
              }
            }]
          };
        }

        case 'anthropic': {
          // Combine system and user messages for Anthropic
          const systemMessage = messages.find(m => m.role === 'system')?.content || '';
          const userMessage = messages.find(m => m.role === 'user')?.content || '';
          const combinedMessage = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;

          const response = await (this.client as Anthropic).messages.create({
            model: this.model as string,
            max_tokens: options.max_tokens ?? 4096,
            temperature: options.temperature ?? 0.7,
            messages: [{
              role: 'user',
              content: combinedMessage
            }],
            ...options
          });

          return {
            choices: [{
              message: {
                content: response.content[0].text
              }
            }]
          };
        }

        default:
          throw new Error('Unsupported provider');
      }
    } catch (error) {
      console.error('Error in createCompletion:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return this.isInitialized && 
           !!this.apiKey && 
           !!this.client && 
           !!this.provider && 
           !!this.model;
  }

  getProvider(): ModelProvider {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured');
    }
    return this.provider as ModelProvider;
  }

  getClient() {
    if (!this.isConfigured()) {
      throw new Error('AI service not properly configured');
    }
    return this.client;
  }

  getModel(): string {
    if (!this.isConfigured()) {
      throw new Error('AI service not configured');
    }
    return this.model as string;
  }
}