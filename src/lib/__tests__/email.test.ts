import { emailTemplates } from '../email'

describe('Email Templates', () => {
  describe('transactionConfirmed', () => {
    test('should generate confirmation email template', () => {
      const template = emailTemplates.transactionConfirmed(
        'John Doe',
        'Tech Conference 2024',
        'txn_123'
      )

      expect(template.subject).toBe('Pembayaran Dikonfirmasi - Tech Conference 2024')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('Tech Conference 2024')
      expect(template.html).toContain('txn_123')
      expect(template.html).toContain('Pembayaran Berhasil Dikonfirmasi!')
    })
  })

  describe('transactionRejected', () => {
    test('should generate rejection email template', () => {
      const template = emailTemplates.transactionRejected(
        'Jane Doe',
        'Music Festival 2024',
        'txn_456',
        'Invalid payment proof'
      )

      expect(template.subject).toBe('Pembayaran Ditolak - Music Festival 2024')
      expect(template.html).toContain('Jane Doe')
      expect(template.html).toContain('Music Festival 2024')
      expect(template.html).toContain('txn_456')
      expect(template.html).toContain('Invalid payment proof')
      expect(template.html).toContain('Pembayaran Ditolak')
    })

    test('should handle rejection without reason', () => {
      const template = emailTemplates.transactionRejected(
        'Jane Doe',
        'Music Festival 2024',
        'txn_456'
      )

      expect(template.html).toContain('Jane Doe')
      expect(template.html).not.toContain('<strong>Alasan:</strong>')
    })
  })

  describe('welcomeEmail', () => {
    test('should generate welcome email template', () => {
      const template = emailTemplates.welcomeEmail('Alice Smith', 'REF123456')

      expect(template.subject).toBe('Selamat Datang di Event Management Platform!')
      expect(template.html).toContain('Alice Smith')
      expect(template.html).toContain('REF123456')
      expect(template.html).toContain('Selamat Datang')
      expect(template.html).toContain('10.000 poin')
    })
  })

  describe('referralReward', () => {
    test('should generate referral reward email template', () => {
      const template = emailTemplates.referralReward(
        'Bob Wilson',
        'Charlie Brown',
        10000
      )

      expect(template.subject).toBe('Anda Mendapat Poin Referral!')
      expect(template.html).toContain('Bob Wilson')
      expect(template.html).toContain('Charlie Brown')
      expect(template.html).toContain('10.000 poin')
      expect(template.html).toContain('Selamat!')
    })
  })
})
