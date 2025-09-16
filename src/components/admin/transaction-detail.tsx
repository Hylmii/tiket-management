'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileImage,
  Download,
  Eye,
  AlertTriangle
} from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { SafeImage } from '@/components/ui/safe-image'
import { useConfirm } from '@/hooks/use-confirm'

interface TransactionDetailProps {
  transaction: {
    id: string
    status: string
    totalAmount: number
    discountAmount: number
    finalAmount: number
    paymentProof: string | null
    paymentDeadline: Date
    createdAt: Date
    updatedAt: Date
    user: {
      id: string
      name: string
      email: string
      createdAt: Date
    }
    event: {
      id: string
      title: string
      description: string
      startDate: Date
      endDate: Date
      location: string
      image: string | null
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
      ticketType: {
        id: string
        name: string
        price: number
        description: string | null
      }
    }>
    pointsUsed: Array<{
      id: string
      points: number
      description: string
    }> | null
    referralUsed: {
      id: string
      code: string
      discount: number
    } | null
  }
}

export function TransactionDetail({ transaction }: TransactionDetailProps) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const { confirm, confirmState, closeDialog } = useConfirm()

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return Clock
      case 'WAITING_CONFIRMATION':
        return AlertTriangle
      case 'CONFIRMED':
        return CheckCircle
      case 'REJECTED':
        return XCircle
      case 'EXPIRED':
        return XCircle
      case 'CANCELED':
        return XCircle
      default:
        return Clock
    }
  }

  const handleConfirmPayment = async () => {
    const confirmed = await confirm({
      title: 'Konfirmasi Pembayaran',
      message: `Apakah Anda yakin ingin mengkonfirmasi pembayaran untuk transaksi ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Konfirmasi',
      cancelText: 'Batal',
      type: 'success'
    })

    if (!confirmed) return

    setIsConfirming(true)
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Gagal mengkonfirmasi pembayaran')
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      alert('Harap masukkan alasan penolakan')
      return
    }

    const confirmed = await confirm({
      title: 'Tolak Pembayaran',
      message: `Apakah Anda yakin ingin menolak pembayaran ini? Alasan: "${rejectionReason}". Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal',
      type: 'danger'
    })

    if (!confirmed) return

    setIsRejecting(true)
    try {
      const response = await fetch(`/api/admin/transactions/${transaction.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      if (response.ok) {
        window.location.reload()
      } else {
        alert('Gagal menolak pembayaran')
      }
    } catch (error) {
      console.error('Error rejecting payment:', error)
      alert('Terjadi kesalahan')
    } finally {
      setIsRejecting(false)
    }
  }

  const StatusIcon = getStatusIcon(transaction.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/transactions"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Transaksi</span>
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
            
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg ${getStatusColor(transaction.status)}`}>
                <StatusIcon className="h-4 w-4" />
                <span>{getStatusText(transaction.status)}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informasi Transaksi
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(transaction.totalAmount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Discount</div>
                  <div className="text-lg font-semibold text-green-600">
                    -{formatCurrency(transaction.discountAmount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Final Amount</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(transaction.finalAmount)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Deadline</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDateTime(transaction.paymentDeadline)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Created At</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDateTime(transaction.createdAt)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatDateTime(transaction.updatedAt)}
                  </div>
                </div>
              </div>

              {/* Discounts Used */}
              {(transaction.pointsUsed || transaction.referralUsed) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Discount Applied
                  </h3>
                  
                  {transaction.pointsUsed && transaction.pointsUsed.length > 0 && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">Points Used</div>
                      {transaction.pointsUsed.map((point) => (
                        <div key={point.id} className="text-sm text-blue-700">
                          {point.points} points - {point.description}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {transaction.referralUsed && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-900">Referral Code</div>
                      <div className="text-sm text-purple-700">
                        Code: {transaction.referralUsed.code} - {transaction.referralUsed.discount}% discount
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informasi Event
              </h2>
              
              <div className="flex space-x-4">
                {transaction.event.image && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <SafeImage
                      src={transaction.event.image}
                      alt={transaction.event.title}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      fallbackText="No Image"
                    />
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {transaction.event.title}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(transaction.event.startDate)} - {formatDate(transaction.event.endDate)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{transaction.event.location}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>by {transaction.event.organizer.name}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                      {transaction.event.category.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Tiket yang Dibeli
              </h2>
              
              <div className="space-y-4">
                {transaction.tickets && transaction.tickets.length > 0 ? (
                  transaction.tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {ticket.ticketType.name}
                          </div>
                          {ticket.ticketType.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {ticket.ticketType.description}
                            </div>
                        )}
                        <div className="text-sm text-gray-600 mt-1">
                          Quantity: {ticket.quantity}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(ticket.ticketType.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          per tiket
                        </div>
                      </div>
                    </div>
                  </div>
                ))) : (
                  <p className="text-gray-500">Tidak ada tiket yang dibeli.</p>
                )}
              </div>
            </div>

            {/* Payment Proof */}
            {transaction.paymentProof && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Bukti Pembayaran
                </h2>
                
                <div className="space-y-4">
                  <div className="relative">
                    <SafeImage
                      src={transaction.paymentProof}
                      alt="Bukti Pembayaran"
                      width={400}
                      height={300}
                      className="w-full max-w-md rounded-lg border border-gray-200 cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                      fallbackText="Bukti pembayaran tidak dapat ditampilkan"
                    />
                    
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <a
                      href={transaction.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download Bukti Pembayaran</span>
                    </a>
                    
                    <button
                      onClick={() => transaction.paymentProof && window.open(transaction.paymentProof, '_blank')}
                      className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Buka di Tab Baru</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Informasi User
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{transaction.user.name}</div>
                    <div className="text-sm text-gray-600">{transaction.user.email}</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Member since: {formatDate(transaction.user.createdAt)}
                </div>
                
                <Link
                  href={`/admin/users/${transaction.user.id}`}
                  className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Lihat Profile User
                </Link>
              </div>
            </div>

            {/* Admin Actions */}
            {transaction.status === 'WAITING_CONFIRMATION' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Admin Actions
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isConfirming}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{isConfirming ? 'Mengkonfirmasi...' : 'Konfirmasi Pembayaran'}</span>
                  </button>
                  
                  <div className="space-y-3">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Alasan penolakan (wajib diisi)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                    
                    <button
                      onClick={handleRejectPayment}
                      disabled={isRejecting || !rejectionReason.trim()}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>{isRejecting ? 'Menolak...' : 'Tolak Pembayaran'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && transaction.paymentProof && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <SafeImage
              src={transaction.paymentProof}
              alt="Bukti Pembayaran"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
              fallbackText="Gambar tidak dapat ditampilkan dalam modal"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeDialog}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
    </div>
  )
}
