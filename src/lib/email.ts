import nodemailer from 'nodemailer'

// Check if email is configured
const isEmailConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  )
}

// Create transporter only if email is configured
const createTransporter = () => {
  if (!isEmailConfigured()) {
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const transporter = createTransporter()

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: any
  message?: string
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  // If email is not configured, log and return success
  if (!isEmailConfigured() || !transporter) {
    console.log('Email not configured. Would send:', { to, subject })
    return { success: true, message: 'Email functionality disabled' }
  }

  try {
    const info = await transporter.sendMail({
      from: `"Event Management Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    
    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

// Email templates
export const emailTemplates = {
  transactionConfirmed: (userName: string, eventTitle: string, transactionId: string) => ({
    subject: 'Pembayaran Dikonfirmasi - ' + eventTitle,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Pembayaran Berhasil Dikonfirmasi!</h2>
        <p>Halo ${userName},</p>
        <p>Pembayaran Anda untuk event <strong>${eventTitle}</strong> telah berhasil dikonfirmasi.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detail Transaksi</h3>
          <p><strong>ID Transaksi:</strong> ${transactionId}</p>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Status:</strong> Dikonfirmasi</p>
        </div>
        <p>Terima kasih telah menggunakan platform kami!</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
        </p>
      </div>
    `
  }),

  transactionRejected: (userName: string, eventTitle: string, transactionId: string, reason?: string) => ({
    subject: 'Pembayaran Ditolak - ' + eventTitle,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Pembayaran Ditolak</h2>
        <p>Halo ${userName},</p>
        <p>Maaf, pembayaran Anda untuk event <strong>${eventTitle}</strong> tidak dapat dikonfirmasi.</p>
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0;">Detail Transaksi</h3>
          <p><strong>ID Transaksi:</strong> ${transactionId}</p>
          <p><strong>Event:</strong> ${eventTitle}</p>
          <p><strong>Status:</strong> Ditolak</p>
          ${reason ? `<p><strong>Alasan:</strong> ${reason}</p>` : ''}
        </div>
        <p>Anda dapat mencoba melakukan pemesanan ulang dengan bukti pembayaran yang benar.</p>
        <p>Jika ada pertanyaan, silakan hubungi customer service kami.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
        </p>
      </div>
    `
  }),

  welcomeEmail: (userName: string, referralCode: string) => ({
    subject: 'Selamat Datang di Event Management Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Selamat Datang, ${userName}!</h2>
        <p>Terima kasih telah bergabung dengan Event Management Platform.</p>
        <p>Akun Anda telah berhasil dibuat dan Anda dapat mulai menjelajahi berbagai event menarik.</p>
        
        <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Kode Referral Anda</h3>
          <p style="font-size: 18px; font-weight: bold; color: #2563eb;">${referralCode}</p>
          <p>Bagikan kode ini kepada teman-teman Anda dan dapatkan 10.000 poin untuk setiap pendaftaran!</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL}/events" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Jelajahi Event
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
        </p>
      </div>
    `
  }),

  referralReward: (userName: string, referredUserName: string, points: number) => ({
    subject: 'Anda Mendapat Poin Referral!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Selamat! Anda Mendapat Poin Referral</h2>
        <p>Halo ${userName},</p>
        <p>Kabar baik! Teman yang Anda referensikan telah bergabung dengan platform kami.</p>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0;">Detail Reward</h3>
          <p><strong>Teman yang bergabung:</strong> ${referredUserName}</p>
          <p><strong>Poin yang Anda dapatkan:</strong> ${points.toLocaleString('id-ID')} poin</p>
        </div>

        <p>Poin ini dapat Anda gunakan untuk mendapatkan diskon pada pembelian tiket event.</p>
        <p>Terus ajak teman-teman lainnya untuk mendapatkan lebih banyak poin!</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #6b7280; font-size: 14px;">
          Email ini dikirim secara otomatis. Mohon jangan membalas email ini.
        </p>
      </div>
    `
  })
}
