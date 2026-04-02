import type { LLMProvider, ChatOptions, Message, ModelInfo } from './base.js'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

interface OpenRouterModel {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: number
  architecture: {
    modality: string
    tokenizer: string
  }
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[]
}

export class OpenRouterProvider implements LLMProvider {
  id = 'openrouter'
  private apiKey: string

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('OpenRouter API key is required')
    this.apiKey = apiKey
  }

  async *chat(messages: Message[], options?: ChatOptions): AsyncGenerator<string> {
    const model = options?.model ?? 'anthropic/claude-3.5-sonnet'

    const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/agent-consensus',
        'X-Title': 'Agent Consensus',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      }),
      signal: options?.signal,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`OpenRouter error ${response.status}: ${text}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const data = trimmed.slice(6)
        if (data === '[DONE]') return

        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    // Default rough estimate; actual cost depends on model
    return (inputTokens * 0.003 + outputTokens * 0.015) / 1000
  }

  async getModelList(): Promise<ModelInfo[]> {
    const response = await fetch(`${OPENROUTER_BASE}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const data: OpenRouterModelsResponse = await response.json()

    return data.data
      .filter(m => m.pricing && m.context_length > 0)
      .map(m => ({
        id: m.id,
        name: m.name,
        provider: m.id.split('/')[0] ?? 'unknown',
        inputPrice: parseFloat(m.pricing.prompt) * 1_000_000,
        outputPrice: parseFloat(m.pricing.completion) * 1_000_000,
        contextLength: m.context_length,
      }))
      .sort((a, b) => a.inputPrice - b.inputPrice)
  }
}
