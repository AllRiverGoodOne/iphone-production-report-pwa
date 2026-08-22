import { describe, expect, it } from 'vitest'
import { isValidEmail } from './settings'

describe('isValidEmail', () => {
  it.each(['report@example.com', 'production.team@example.co.jp'])("accepts %s", (value) => {
    expect(isValidEmail(value)).toBe(true)
  })

  it.each(['', 'invalid', 'name@', '@example.com', 'name @example.com'])("rejects %s", (value) => {
    expect(isValidEmail(value)).toBe(false)
  })
})
