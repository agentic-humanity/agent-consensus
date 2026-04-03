import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface OpenRouterModelsResponse {
  data: Array<{
    id: string
    name: string
    pricing?: {
      prompt?: string
      completion?: string
    }
    context_length?: number
  }>
}

interface OpenRouterKeyResponse {
  data?: {
    label?: string
    total_credits?: number
    total_usage?: number
  }
}

interface OpenRouterChatResponse {
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
  }
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const app = new Hono()

// In-memory storage
const sessions = new Map()
let nextId = 1

app.use('*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'agent-consensus' }))

// 获取模型列表 - 需要 API Key
app.get('/api/models', async (c) => {
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey) {
    return c.json({ error: 'API Key required. Please set your OpenRouter API Key in settings.' }, 401)
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://github.com/agentic-humanity/agent-consensus',
        'X-Title': 'Agent Consensus',
      },
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return c.json({ error: 'Invalid API Key' }, 401)
      }
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json() as OpenRouterModelsResponse
    
    const models = data.data.map((m) => ({
      id: m.id,
      name: m.name,
      provider: m.id.split('/')[0] ?? 'unknown',
      inputPrice: parseFloat(m.pricing?.prompt ?? '0') * 1000000,
      outputPrice: parseFloat(m.pricing?.completion ?? '0') * 1000000,
      contextLength: m.context_length ?? 4096,
    })).sort((a, b) => {
      if (a.provider !== b.provider) {
        return a.provider.localeCompare(b.provider)
      }
      return a.name.localeCompare(b.name)
    })
    
    return c.json({ models })
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return c.json({ error: 'Failed to fetch models from OpenRouter' }, 500)
  }
})

// 获取余额
app.get('/api/credits', async (c) => {
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey) {
    return c.json({ error: 'API Key required' }, 401)
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        return c.json({ error: 'Invalid API Key' }, 401)
      }
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = await response.json() as OpenRouterKeyResponse
    return c.json({
      total: data.data?.total_credits ?? 0,
      used: data.data?.total_usage ?? 0,
      remaining: (data.data?.total_credits ?? 0) - (data.data?.total_usage ?? 0),
    })
  } catch (error) {
    console.error('Failed to fetch credits:', error)
    return c.json({ error: 'Failed to fetch credits' }, 500)
  }
})

// 验证 API Key
app.post('/api/validate-key', async (c) => {
  const { apiKey } = await c.req.json()
  
  if (!apiKey || !apiKey.startsWith('sk-or-v1-')) {
    return c.json({ valid: false, error: 'Invalid API Key format' })
  }
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })
    
    if (response.ok) {
      const data = await response.json() as OpenRouterKeyResponse
      return c.json({ 
        valid: true, 
        label: data.data?.label ?? 'Unknown',
        remaining: (data.data?.total_credits ?? 0) - (data.data?.total_usage ?? 0)
      })
    } else {
      return c.json({ valid: false, error: 'Invalid API Key' })
    }
  } catch {
    return c.json({ valid: false, error: 'Failed to validate key' })
  }
})

// 会话 CRUD
app.get('/api/sessions', async (c) => {
  const sessionList = Array.from(sessions.values()).sort((a: any, b: any) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return c.json({ sessions: sessionList })
})

app.post('/api/sessions', async (c) => {
  const body = await c.req.json() as any
  const id = String(nextId++)
  
  const session = {
    id,
    mode: body.mode,
    topic: body.topic,
    config: body.config,
    status: 'pending',
    totalCost: 0,
    currentRound: 0,
    createdAt: new Date().toISOString(),
    finishedAt: null
  }
  
  sessions.set(id, session)
  return c.json(session, 201)
})

app.get('/api/sessions/:id', async (c) => {
  const session = sessions.get(c.req.param('id'))
  if (!session) return c.json({ error: 'Not found' }, 404)
  return c.json(session)
})

// 真实调用 OpenRouter 进行讨论
app.post('/api/sessions/:id/start', async (c) => {
  const apiKey = c.req.header('x-api-key')
  
  if (!apiKey) {
    return c.json({ error: 'API Key required' }, 401)
  }
  
  const sessionId = c.req.param('id')
  const session = sessions.get(sessionId)
  
  if (!session) return c.json({ error: 'Not found' }, 404)
  
  const config = session.config
  session.status = 'running'
  sessions.set(sessionId, session)
  
  const rounds = []
  let totalCost = 0
  
  try {
    if (session.mode === 'proposal') {
      // Proposal-Review Mode
      const { proposerModel, reviewerModels, threshold = 7, maxRounds = 5 } = config
      
      let currentRound = 1
      let completed = false
      
      while (currentRound <= maxRounds && !completed) {
        const roundEvents = []
        
        // Proposer generates proposal
        const proposerStart = Date.now()
        const proposerResponse = await callOpenRouter(apiKey, proposerModel, [
          { role: 'system', content: 'You are a solution architect. Generate a detailed technical proposal for the given topic.' },
          { role: 'user', content: `Topic: ${session.topic}\n\nPlease provide a comprehensive proposal.` }
        ])
        const proposerLatency = Date.now() - proposerStart
        
        roundEvents.push({
          role: 'proposer',
          model: proposerModel,
          output: proposerResponse.content,
          score: null,
          costUsd: proposerResponse.cost,
          latencyMs: proposerLatency
        })
        totalCost += proposerResponse.cost
        
        // Reviewers evaluate
        const scores = []
        for (const reviewerModel of reviewerModels) {
          const reviewerStart = Date.now()
          const reviewerResponse = await callOpenRouter(apiKey, reviewerModel, [
            { role: 'system', content: 'You are a critical reviewer. Review the proposal and provide constructive feedback. End your response with "Score: X/10" where X is your rating.' },
            { role: 'user', content: `Topic: ${session.topic}\n\nProposal:\n${proposerResponse.content}\n\nPlease review this proposal and provide your score (1-10).` }
          ])
          const reviewerLatency = Date.now() - reviewerStart
          
          // Extract score from response
          const scoreMatch = reviewerResponse.content.match(/Score:\s*(\d+(?:\.\d+)?)\s*\/\s*10/i)
          const score = scoreMatch ? parseFloat(scoreMatch[1]) : null
          if (score) scores.push(score)
          
          roundEvents.push({
            role: 'reviewer',
            model: reviewerModel,
            output: reviewerResponse.content,
            score,
            costUsd: reviewerResponse.cost,
            latencyMs: reviewerLatency
          })
          totalCost += reviewerResponse.cost
        }
        
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
        const decision = avgScore >= threshold ? 'completed' : 'continue'
        
        rounds.push({
          roundNum: currentRound,
          avgScore: Math.round(avgScore * 10) / 10,
          decision,
          events: roundEvents
        })
        
        if (decision === 'completed' || currentRound >= maxRounds) {
          completed = true
        }
        
        currentRound++
      }
    } else {
      // Roundtable Mode
      const { participantModels, summarizerModel } = config
      const roundEvents = []
      const perspectives = []
      
      // Participants provide perspectives
      for (const model of participantModels) {
        const start = Date.now()
        const response = await callOpenRouter(apiKey, model, [
          { role: 'system', content: 'You are participating in a roundtable discussion. Share your perspective on the topic.' },
          { role: 'user', content: `Topic: ${session.topic}\n\nShare your perspective.` }
        ])
        const latency = Date.now() - start
        
        perspectives.push(`${model}: ${response.content}`)
        roundEvents.push({
          role: 'participant',
          model,
          output: response.content,
          score: null,
          costUsd: response.cost,
          latencyMs: latency
        })
        totalCost += response.cost
      }
      
      // Summarizer consolidates
      const summarizerStart = Date.now()
      const summaryResponse = await callOpenRouter(apiKey, summarizerModel, [
        { role: 'system', content: 'You are a facilitator. Summarize the key points from all perspectives and provide a consensus view.' },
        { role: 'user', content: `Topic: ${session.topic}\n\nPerspectives:\n${perspectives.join('\n\n')}\n\nPlease provide a summary and consensus.` }
      ])
      const summarizerLatency = Date.now() - summarizerStart
      
      roundEvents.push({
        role: 'summarizer',
        model: summarizerModel,
        output: summaryResponse.content,
        score: null,
        costUsd: summaryResponse.cost,
        latencyMs: summarizerLatency
      })
      totalCost += summaryResponse.cost
      
      rounds.push({
        roundNum: 1,
        avgScore: null,
        decision: 'completed',
        events: roundEvents
      })
    }
    
    // Update session
    session.status = 'completed'
    session.totalCost = Math.round(totalCost * 1000) / 1000
    session.currentRound = rounds.length
    session.finishedAt = new Date().toISOString()
    session.rounds = rounds
    sessions.set(sessionId, session)
    
    return c.json(session)
    
  } catch (error: any) {
    session.status = 'failed'
    sessions.set(sessionId, session)
    console.error('Session failed:', error)
    return c.json({ error: error.message || 'Session failed' }, 500)
  }
})

// Helper function to call OpenRouter
async function callOpenRouter(apiKey: string, model: string, messages: any[]) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/agentic-humanity/agent-consensus',
      'X-Title': 'Agent Consensus',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })
  
  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error: ${error}`)
  }
  
  const data = await response.json() as OpenRouterChatResponse
  const usage = data.usage ?? {}
  
  const modelInfo = await getModelPricing(model)
  const inputTokens = usage.prompt_tokens ?? 0
  const outputTokens = usage.completion_tokens ?? 0
  const cost = (inputTokens * modelInfo.inputPrice + outputTokens * modelInfo.outputPrice) / 1000000
  
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    cost: Math.max(cost, 0.0001),
  }
}

// Cache for model pricing
const pricingCache = new Map()

async function getModelPricing(modelId: string) {
  if (pricingCache.has(modelId)) {
    return pricingCache.get(modelId)
  }
  
  // Default pricing
  const defaultPricing = { inputPrice: 3, outputPrice: 15 }
  pricingCache.set(modelId, defaultPricing)
  return defaultPricing
}

export { app }