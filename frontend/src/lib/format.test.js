import { describe, expect, it, vi } from 'vitest'
import { displayName, initials, primaryValue, todayLabel } from './format'

describe('format helpers', () => {
  it('TC-FE-FMT-01: builds contact initials from first and last name', () => {
    expect(initials('Maya', 'Chen')).toBe('MC')
    expect(initials('single', '')).toBe('S')
    expect(initials('', '')).toBe('?')
  })

  it('TC-FE-FMT-02: displays a complete, partial, or fallback contact name', () => {
    expect(displayName({ firstName: 'Maya', lastName: 'Chen' })).toBe('Maya Chen')
    expect(displayName({ firstName: 'Maya' })).toBe('Maya')
    expect(displayName({})).toBe('Unnamed contact')
  })

  it('TC-FE-FMT-03: returns the primary item value before fallback values', () => {
    const emails = [
      { email: 'backup@example.com', primary: false },
      { email: 'main@example.com', primary: true },
    ]

    expect(primaryValue(emails, 'email')).toBe('main@example.com')
    expect(primaryValue([{ phone: '+1 555 0100' }], 'phone')).toBe('+1 555 0100')
    expect(primaryValue([], 'email')).toBe('')
  })

  it('TC-FE-FMT-04: formats the current date for dashboard headings', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-02T10:00:00'))

    expect(todayLabel()).toBe('Tuesday, June 2')
  })
})
