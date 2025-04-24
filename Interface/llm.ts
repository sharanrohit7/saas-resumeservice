export interface LLMModel {
    provider: 'openai' | 'anthropic' | 'google' | 'deepseek';
    name: string; // e.g., 'gpt-4-turbo', 'claude-3-opus', etc.
    apiKey: string;
    endpoint?: string; // Optional override for custom endpoints
  }
  