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
  Ticket,
  Eye
} from 'lucide-react'
import { formatCurrency, formatDateTime, getTimeRemaining } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

interface OrganizerTransactionDetailProps {
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

export function OrganizerTransactionDetail({ transaction }: OrganizerTransactionDetailProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const { confirm } = useConfirm()

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

  const handleApprove = async () => {
    const confirmed = await confirm({
      title: 'Konfirmasi Pembayaran',
      message: 'Apakah Anda yakin ingin mengkonfirmasi pembayaran ini? User akan mendapatkan tiket dan aksi ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Konfirmasi',
      cancelText: 'Batal',
      type: 'success'
    })

    if (!confirmed) return

    setLoading('approve')
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}/confirm`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal mengkonfirmasi pembayaran')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    const confirmed = await confirm({
      title: 'Tolak Pembayaran',
      message: 'Apakah Anda yakin ingin menolak pembayaran ini? User akan diberitahu dan transaksi akan dibatalkan.',
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal',
      type: 'danger'
    })

    if (!confirmed) return

    setLoading('reject')
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}/reject`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal menolak pembayaran')
      }

      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan')
    } finally {
      setLoading(null)
    }
  }

  const canTakeAction = transaction.status === 'WAITING_CONFIRMATION'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/transactions"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali ke Manajemen Transaksi</span>
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

        {/* Action Buttons */}
        {canTakeAction && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-blue-800 mb-1">
                  Aksi Diperlukan
                </h3>
                <p className="text-blue-700 text-sm">
                  Transaksi ini menunggu konfirmasi Anda. Silakan periksa bukti pembayaran dan konfirmasi atau tolak transaksi.
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={handleApprove}
                  disabled={loading === 'approve'}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'approve' ? (
                    'Memproses...'
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Konfirmasi
                    </>
                  )}
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading === 'reject'}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading === 'reject' ? (
                    'Memproses...'
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Tolak
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informasi Pembeli
              </h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{transaction.user.name}</div>
                  <div className="text-sm text-gray-600">{transaction.user.email}</div>
                </div>
              </div>
            </div>

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

            {/* Payment Proof Display */}
            {transaction.paymentProof && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bukti Pembayaran
                  </h2>
                  <a
                    href={transaction.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Full Size
                  </a>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={transaction.paymentProof} 
                    alt="Bukti Pembayaran"
                    className="w-full h-auto max-h-96 object-contain"
                  />
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
