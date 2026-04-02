export interface LLMProvider {
  id: string
  chat(messages: Message[], options?: ChatOptions): AsyncGenerator<string>
  estimateCost(inputTokens: number, outputTokens: number): number
  getModelList(): Promise<ModelInfo[]>
}

export interface ChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  signal?: AbortSignal
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  inputPrice: number
  outputPrice: number
  contextLength: number
}
