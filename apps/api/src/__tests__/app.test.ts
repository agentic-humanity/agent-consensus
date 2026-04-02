import { describe, it, expect } from 'vitest'
import { app } from '../app.js'

describe('API Health', () => {
  it('should return health status', async () => {
    const res = await app.request('/api/health')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ status: 'ok', service: 'agent-consensus' })
  })
})