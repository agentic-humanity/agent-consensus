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

export interface SessionConfig {
  budgetLimit: number
  maxRounds: number
  proposerModel?: string
  reviewerModels?: string[]
  threshold?: number
  scoringPrompt?: string
  participantModels?: string[]
  summarizerModel?: string
  perspectivePrompts?: Record<string, string>
}

export type SessionMode = 'proposal' | 'roundtable'
export type SessionStatus = 'pending' | 'running' | 'completed' | 'budget_exceeded' | 'failed'
export type EventRole = 'proposer' | 'reviewer' | 'summarizer' | 'participant'

export interface Session {
  id: string
  mode: SessionMode
  topic: string
  config: SessionConfig
  status: SessionStatus
  totalCost: number
  currentRound: number
  createdAt: Date
  finishedAt?: Date
}

export interface Round {
  id: string
  sessionId: string
  roundNum: number
  avgScore?: number
  decision: 'continue' | 'completed'
  events: Event[]
}

export interface Event {
  id: string
  roundId: string
  role: EventRole
  modelId: string
  systemPrompt?: string
  inputMessages: Message[]
  rawOutput: string
  parsedScore?: number
  costUsd: number
  latencyMs: number
  createdAt: Date
}

export type StreamEvent =
  | { type: 'round_start'; round: number }
  | { type: 'model_start'; role: string; model: string }
  | { type: 'model_chunk'; text: string }
  | { type: 'model_end'; cost: number; latency: number; score?: number }
  | { type: 'round_end'; round: number; avgScore: number; decision: 'continue' | 'completed' }
  | { type: 'session_end'; status: SessionStatus; totalCost: number }
  | { type: 'error'; message: string }
