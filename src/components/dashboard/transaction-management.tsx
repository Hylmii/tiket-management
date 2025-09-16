'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  User,
  Calendar,
  CreditCard,
  AlertTriangle,
  Download
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useConfirm } from '@/hooks/use-confirm'

interface Transaction {
  id: string
  finalAmount: number
  status: string
  paymentProof: string | null
  createdAt: Date
  event: {
    id: string
    title: string
    startDate: Date
  }
  user: {
    id: string
    name: string
    email: string
  }
  transactionTickets: Array<{
    quantity: number
    ticketType: {
      name: string
    }
  }>
}

interface TransactionManagementProps {
  transactions: Transaction[]
}

export function TransactionManagement({ transactions }: TransactionManagementProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<string>('all')
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
        return <AlertTriangle className="h-4 w-4" />
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

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true
    return transaction.status === filter
  })

  const handleApprove = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Konfirmasi Pembayaran',
      message: 'Apakah Anda yakin ingin mengkonfirmasi pembayaran ini? Aksi ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Konfirmasi',
      cancelText: 'Batal'
    })

    if (!confirmed) return

    setLoading(transactionId)
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/confirm`, {
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

  const handleReject = async (transactionId: string) => {
    const confirmed = await confirm({
      title: 'Tolak Pembayaran',
      message: 'Apakah Anda yakin ingin menolak pembayaran ini? User akan diberitahu dan transaksi akan dibatalkan.',
      confirmText: 'Ya, Tolak',
      cancelText: 'Batal'
    })

    if (!confirmed) return

    setLoading(transactionId)
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}/reject`, {
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

  const pendingConfirmations = transactions.filter(t => t.status === 'WAITING_CONFIRMATION').length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Transaksi
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola pembayaran dan konfirmasi transaksi untuk event Anda
              </p>
            </div>
            <Link
              href="/dashboard/events"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {/* Alert for pending confirmations */}
        {pendingConfirmations > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">
                  Ada {pendingConfirmations} transaksi menunggu konfirmasi
                </h3>
                <p className="text-yellow-700 text-sm">
                  Silakan periksa bukti pembayaran dan konfirmasi transaksi yang valid.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'Semua', count: transactions.length },
                { key: 'WAITING_CONFIRMATION', label: 'Menunggu Konfirmasi', count: transactions.filter(t => t.status === 'WAITING_CONFIRMATION').length },
                { key: 'CONFIRMED', label: 'Dikonfirmasi', count: transactions.filter(t => t.status === 'CONFIRMED').length },
                { key: 'REJECTED', label: 'Ditolak', count: transactions.filter(t => t.status === 'REJECTED').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'Belum Ada Transaksi' : 'Tidak Ada Transaksi'}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'Transaksi akan muncul setelah ada pembelian tiket untuk event Anda'
                  : `Tidak ada transaksi dengan status "${getStatusText(filter)}"`
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaksi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pembeli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{transaction.id.substring(0, 8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(transaction.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.transactionTickets.map(tt => 
                              `${tt.quantity}x ${tt.ticketType.name}`
                            ).join(', ')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.event.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(transaction.event.startDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.finalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusIcon(transaction.status)}
                          <span>{getStatusText(transaction.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/dashboard/transactions/${transaction.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          
                          {transaction.status === 'WAITING_CONFIRMATION' && (
                            <>
                              <button
                                onClick={() => handleApprove(transaction.id)}
                                disabled={loading === transaction.id}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(transaction.id)}
                                disabled={loading === transaction.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          
                          {transaction.paymentProof && (
                            <a
                              href={transaction.paymentProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
