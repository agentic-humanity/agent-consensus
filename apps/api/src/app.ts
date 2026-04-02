import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/api/health', (c) => c.json({ status: 'ok', service: 'agent-consensus' }))

app.get('/api/models', async (c) => {
  // TODO: fetch from OpenRouter
  return c.json({ models: [] })
})

app.get('/api/sessions', (c) => {
  // TODO: list sessions from DB
  return c.json({ sessions: [] })
})

app.post('/api/sessions', async (c) => {
  // TODO: create session
  return c.json({ id: 'todo' }, 201)
})

app.get('/api/sessions/:id', (c) => {
  // TODO: get session detail
  return c.json({ id: c.req.param('id') })
})

app.post('/api/sessions/:id/start', (c) => {
  // TODO: SSE stream
  return c.json({ message: 'not implemented' })
})

export { app }
