import { serve } from '@hono/node-server'
import { app } from './app.js'

const port = parseInt(process.env['PORT'] ?? '8888', 10)

console.log(`🚀 Agent Consensus API running on http://localhost:${port}`)

serve({ fetch: app.fetch, port })
