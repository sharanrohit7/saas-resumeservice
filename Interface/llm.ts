export interface LLMModel {
  provider: 'openai' | 'anthropic' | 'google' | 'deepseek';
  name: string; // e.g., 'gpt-4-turbo', 'claude-3-opus', etc.
  apiKey: string;
  endpoint?: string; // Optional override for custom endpoints
}


export interface Messages {
  // systemPrompt: string;
  // userPrompt: string;
  resumeInfo: string;
  job_desc : string;
  company_name: string;
  job_title: string
}

export enum SupportedModels {
  GPT4 = "gpt-4",
  GPT35 = "gpt-3.5-turbo",
  Claude = "claude-3-opus-20240229",
  Custom = "custom-model"
}