import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Demo models data
const DEMO_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', inputPrice: 3, outputPrice: 15, contextLength: 200000 },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', inputPrice: 5, outputPrice: 15, contextLength: 128000 },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google', inputPrice: 1.25, outputPrice: 5, contextLength: 1000000 },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'Meta', inputPrice: 0.52, outputPrice: 0.75, contextLength: 128000 },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', inputPrice: 0.25, outputPrice: 1.25, contextLength: 200000 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', inputPrice: 0.15, outputPrice: 0.6, contextLength: 128000 },
]

// In-memory storage
const sessions = new Map()
let nextId = 1

app.use('*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'agent-consensus' }))

app.get('/api/models', async (c) => {
  return c.json({ models: DEMO_MODELS })
})

app.get('/api/credits', async (c) => {
  return c.json({ total: 100, used: 0.42, remaining: 99.58 })
})

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
    config: JSON.stringify(body.config),
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

app.post('/api/sessions/:id/start', async (c) => {
  const sessionId = c.req.param('id')
  const session = sessions.get(sessionId)
  
  if (!session) return c.json({ error: 'Not found' }, 404)
  
  // Simulate full discussion flow
  const now = Date.now()
  
  const rounds = [
    {
      roundNum: 1,
      avgScore: 5.5,
      decision: 'continue',
      events: [
        {
          role: 'proposer',
          model: 'Claude 3.5 Sonnet',
          output: 'I propose a JWT-based authentication system with refresh tokens. The implementation includes:\n\n1. Access tokens with 15-minute expiration\n2. Refresh tokens with 7-day expiration stored in httpOnly cookies\n3. Token rotation on each refresh\n4. Secure logout with token blacklisting\n\nThis approach provides a good balance between security and user experience.',
          score: null,
          costUsd: 0.002,
          latencyMs: 1200
        },
        {
          role: 'reviewer',
          model: 'GPT-4o',
          output: 'The proposal is solid but lacks multi-factor authentication (MFA). In 2025, MFA should be a standard requirement for any authentication system. I recommend adding TOTP-based 2FA as an optional but recommended feature.\n\nScore: 6/10 - Good foundation, missing critical security features.',
          score: 6,
          costUsd: 0.003,
          latencyMs: 1500
        },
        {
          role: 'reviewer',
          model: 'Gemini Pro 1.5',
          output: 'The JWT approach is well-established, but the proposal lacks details about:\n- Rate limiting to prevent brute force attacks\n- Account lockout mechanisms\n- Password strength requirements\n- Session management across devices\n\nScore: 5/10 - Adequate but incomplete.',
          score: 5,
          costUsd: 0.001,
          latencyMs: 800
        }
      ]
    },
    {
      roundNum: 2,
      avgScore: 8.0,
      decision: 'completed',
      events: [
        {
          role: 'proposer',
          model: 'Claude 3.5 Sonnet',
          output: 'Thank you for the feedback. Here is the revised proposal:\n\n1. **MFA Support**: TOTP-based 2FA using authenticator apps, with backup codes\n2. **Security Enhancements**:\n   - Rate limiting: 5 failed attempts = 15-min lockout\n   - Account lockout after 10 failed attempts (email notification)\n   - Password requirements: 12+ chars, mixed case, numbers, symbols\n   - Device fingerprinting for suspicious login detection\n3. **Session Management**:\n   - View and revoke active sessions\n   - Geo-location tracking\n   - Email notifications for new device logins\n4. **OAuth Integration**: Google, GitHub, Apple sign-in support\n\nThis comprehensive solution addresses all security concerns raised.',
          score: null,
          costUsd: 0.004,
          latencyMs: 1800
        },
        {
          role: 'reviewer',
          model: 'GPT-4o',
          output: 'Excellent revision! The addition of MFA, rate limiting, and comprehensive session management addresses all my concerns. The OAuth integration is a nice bonus for user experience.\n\nScore: 8/10 - Production-ready solution.',
          score: 8,
          costUsd: 0.003,
          latencyMs: 1400
        },
        {
          role: 'reviewer',
          model: 'Gemini Pro 1.5',
          output: 'The revised proposal is comprehensive and well-thought-out. The security measures are appropriate for an enterprise-grade system. I particularly appreciate the device fingerprinting and geo-location features.\n\nScore: 8/10 - Ready for implementation.',
          score: 8,
          costUsd: 0.002,
          latencyMs: 1100
        }
      ]
    }
  ]
  
  // Update session
  session.status = 'completed'
  session.totalCost = 0.015
  session.currentRound = 2
  session.finishedAt = new Date().toISOString()
  sessions.set(sessionId, session)
  
  return c.json({
    ...session,
    rounds,
    finalOutput: 'Based on the multi-model discussion, the consensus is:\n\n**Recommended Architecture**: JWT-based authentication with comprehensive security features\n\n**Key Components**:\n1. Short-lived access tokens (15 min) + refresh tokens (7 days)\n2. TOTP-based MFA with backup codes\n3. Rate limiting and account lockout\n4. Strong password requirements\n5. Session management with device tracking\n6. OAuth 2.0 integration\n\n**Consensus Achieved**: Average score improved from 5.5/10 to 8.0/10 after 2 rounds of iteration.'
  })
})

export { app }