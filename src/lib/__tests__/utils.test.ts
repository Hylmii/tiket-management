import { formatCurrency, formatDate, formatDateTime } from '../utils'

describe('Utils Functions', () => {
  describe('formatCurrency', () => {
    test('should format currency in IDR format', () => {
      expect(formatCurrency(100000)).toBe('Rp 100.000')
      expect(formatCurrency(1500000)).toBe('Rp 1.500.000')
      expect(formatCurrency(0)).toBe('Rp 0')
    })

    test('should handle decimal numbers', () => {
      expect(formatCurrency(100000.5)).toBe('Rp 100.000')
      expect(formatCurrency(100000.9)).toBe('Rp 100.001')
    })

    test('should handle negative numbers', () => {
      expect(formatCurrency(-100000)).toBe('Rp -100.000')
    })
  })

  describe('formatDate', () => {
    test('should format date correctly', () => {
      const date = new Date('2024-12-25T10:30:00')
      expect(formatDate(date)).toBe('25 Desember 2024')
    })

    test('should handle different months', () => {
      const date = new Date('2024-06-15T10:30:00')
      expect(formatDate(date)).toBe('15 Juni 2024')
    })
  })

  describe('formatDateTime', () => {
    test('should format date and time correctly', () => {
      const date = new Date('2024-12-25T10:30:00')
      expect(formatDateTime(date)).toBe('25 Desember 2024, 10:30')
    })

    test('should handle different times', () => {
      const date = new Date('2024-06-15T14:45:00')
      expect(formatDateTime(date)).toBe('15 Juni 2024, 14:45')
    })
  })
})
