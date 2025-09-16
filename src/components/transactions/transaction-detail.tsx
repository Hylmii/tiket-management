'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Upload,
  Download,
  ArrowLeft,
  User,
  Ticket
} from 'lucide-react'
import { formatCurrency, formatDateTime, getTimeRemaining } from '@/lib/utils'

interface TransactionDetailProps {
  transaction: {
    id: string
    totalAmount: number
    pointsUsed: number
    voucherDiscount: number
    couponDiscount: number
    finalAmount: number
    status: string
    paymentProof: string | null
    paymentDeadline: Date | null
    adminNotes: string | null
    createdAt: Date
    event: {
      id: string
      title: string
      startDate: Date
      endDate: Date
      location: string
      organizer: {
        name: string
        email: string
      }
      category: {
        name: string
      }
    }
    tickets: Array<{
      id: string
      quantity: number
      unitPrice: number
      ticketType: {
        id: string
        name: string
        description: string | null
      }
    }>
    voucher?: {
      id: string
      code: string
      discount: number
      discountType: string
    } | null
    coupon?: {
      id: string
      code: string
      discount: number
      discountType: string
    } | null
    user: {
      name: string
      email: string
    }
  }
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800'
      case 'WAITING_CONFIRMATION':
        return 'bg-blue-100 text-blue-800'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return <Clock className="h-4 w-4" />
      case 'WAITING_CONFIRMATION':
        return <Clock className="h-4 w-4" />
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      case 'EXPIRED':
        return <XCircle className="h-4 w-4" />
      case 'CANCELED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return 'Menunggu Pembayaran'
      case 'WAITING_CONFIRMATION':
        return 'Menunggu Konfirmasi'
      case 'CONFIRMED':
        return 'Dikonfirmasi'
      case 'REJECTED':
        return 'Ditolak'
      case 'EXPIRED':
        return 'Kadaluarsa'
      case 'CANCELED':
        return 'Dibatalkan'
      default:
        return status
    }
  }

  const isExpired = transaction.paymentDeadline 
    ? new Date(transaction.paymentDeadline) < new Date()
    : false

  const timeRemaining = transaction.paymentDeadline && !isExpired
    ? getTimeRemaining(new Date(transaction.paymentDeadline))
    : null

  const canUploadPayment = transaction.status === 'WAITING_PAYMENT' && !isExpired

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Hanya file gambar yang diperbolehkan')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file maksimal 5MB')
      return
    }

    setUploading(true)
    setUploadError('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('transactionId', transaction.id)

      const response = await fetch('/api/transactions/payment-proof', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal upload bukti pembayaran')
      }

      // Show success message
      alert('Bukti pembayaran berhasil diupload! Kami akan segera memverifikasi pembayaran Anda.')
      
      // Refresh page to show updated status
      router.refresh()
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/profile"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Profil</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detail Transaksi
              </h1>
              <p className="text-gray-600">
                ID: {transaction.id}
              </p>
            </div>
            
            <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
              {getStatusIcon(transaction.status)}
              <span>{getStatusText(transaction.status)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detail Event
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{transaction.event.title}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {transaction.event.category.name}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Tanggal</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(transaction.event.startDate)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Lokasi</div>
                      <div className="text-sm text-gray-600">{transaction.event.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">Penyelenggara</div>
                      <div className="text-sm text-gray-600">{transaction.event.organizer.name}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Detail Tiket
              </h2>
              <div className="space-y-3">
                {transaction.tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Ticket className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">{ticket.ticketType.name}</div>
                        {ticket.ticketType.description && (
                          <div className="text-sm text-gray-600">{ticket.ticketType.description}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {ticket.quantity} x {formatCurrency(ticket.unitPrice)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: {formatCurrency(ticket.quantity * ticket.unitPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Status */}
            {transaction.status === 'WAITING_PAYMENT' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Bukti Pembayaran
                </h2>
                
                {timeRemaining && !timeRemaining.isExpired ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800">
                          Waktu Pembayaran Tersisa
                        </h3>
                        <p className="text-yellow-700 text-sm">
                          {timeRemaining.hours} jam {timeRemaining.minutes} menit {timeRemaining.seconds} detik
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-red-800">
                          Waktu Pembayaran Habis
                        </h3>
                        <p className="text-red-700 text-sm">
                          Transaksi ini akan segera dibatalkan secara otomatis.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {canUploadPayment && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm text-gray-600 mb-4">
                          Upload bukti pembayaran (JPG, PNG, max 5MB)
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                          id="payment-proof"
                        />
                        <label
                          htmlFor="payment-proof"
                          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                            uploading 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                          }`}
                        >
                          {uploading ? 'Mengupload...' : 'Pilih File'}
                        </label>
                      </div>
                    </div>

                    {uploadError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{uploadError}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Proof Display */}
            {transaction.paymentProof && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Bukti Pembayaran
                </h2>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={transaction.paymentProof} 
                    alt="Bukti Pembayaran"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Waiting Confirmation Status */}
            {transaction.status === 'WAITING_CONFIRMATION' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Status Pembayaran
                </h2>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800">
                        Menunggu Konfirmasi Admin
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        Bukti pembayaran Anda sudah diterima dan sedang diverifikasi oleh admin. 
                        Kami akan mengirimkan notifikasi melalui email setelah pembayaran dikonfirmasi.
                      </p>
                      <p className="text-blue-700 text-sm mt-2 font-medium">
                        Proses verifikasi biasanya memakan waktu 1-24 jam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Confirmed Status */}
            {transaction.status === 'CONFIRMED' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Pembayaran Dikonfirmasi
                </h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800">
                        Selamat! Tiket Anda Sudah Aktif
                      </h3>
                      <p className="text-green-700 text-sm mt-1">
                        Pembayaran Anda telah dikonfirmasi. Tiket Anda sudah aktif dan siap digunakan untuk menghadiri event.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/profile"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Lihat Tiket Saya
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Rejected Status */}
            {transaction.status === 'REJECTED' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Pembayaran Ditolak
                </h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-red-800">
                        Pembayaran Tidak Valid
                      </h3>
                      <p className="text-red-700 text-sm mt-1">
                        Maaf, bukti pembayaran yang Anda upload tidak dapat diverifikasi. 
                        Silakan periksa kembali detail pembayaran atau hubungi customer service.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/events"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          Cari Event Lain
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {transaction.adminNotes && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Catatan Admin
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{transaction.adminNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Ringkasan Pembayaran
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(transaction.totalAmount)}</span>
                  </div>

                  {transaction.pointsUsed > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Diskon Poin</span>
                      <span>-{formatCurrency(transaction.pointsUsed)}</span>
                    </div>
                  )}

                  {transaction.couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Diskon Kupon
                        {transaction.coupon && ` (${transaction.coupon.code})`}
                      </span>
                      <span>-{formatCurrency(transaction.couponDiscount)}</span>
                    </div>
                  )}

                  {transaction.voucherDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Diskon Voucher
                        {transaction.voucher && ` (${transaction.voucher.code})`}
                      </span>
                      <span>-{formatCurrency(transaction.voucherDiscount)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Bayar</span>
                      <span className="text-blue-600">{formatCurrency(transaction.finalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Transaksi</span>
                    <span className="text-gray-900">{formatDateTime(transaction.createdAt)}</span>
                  </div>
                  
                  {transaction.paymentDeadline && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Batas Pembayaran</span>
                      <span className="text-gray-900">{formatDateTime(transaction.paymentDeadline)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
