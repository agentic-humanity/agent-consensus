import { describe, it, expect } from 'vitest'
import type { SessionMode, SessionStatus } from '../types.js'

describe('Core Types', () => {
  it('should have SessionMode type', () => {
    // Type-only test - just verify it compiles
    const test: SessionMode = 'proposal'
    expect(test).toBe('proposal')
  })

  it('should have SessionStatus type', () => {
    // Type-only test - just verify it compiles
    const test: SessionStatus = 'pending'
    expect(test).toBe('pending')
  })
})
