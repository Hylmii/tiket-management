import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { NoTransactionsFound, NoSearchResults } from '@/components/ui/empty-state'
import { TransactionStatus } from '@prisma/client'

interface SearchParams {
  status?: string
  page?: string
}

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const page = parseInt(params.page || '1')
  const status = params.status
  const limit = 20

  const where = status && Object.values(TransactionStatus).includes(status.toUpperCase() as TransactionStatus) 
    ? { status: status.toUpperCase() as TransactionStatus } 
    : {}

  const [transactions, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        event: {
          select: {
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.transaction.count({ where })
  ])

  const totalPages = Math.ceil(totalCount / limit)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Manajemen Transaksi
              </h1>
              <p className="text-gray-600">
                Kelola dan moderasi transaksi platform
              </p>
            </div>
            
            <Link 
              href="/admin"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Filter Status:
              </label>
              <div className="flex flex-wrap gap-2">
                <Link 
                  href="/admin/transactions"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    !status 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua
                </Link>
                <Link 
                  href="/admin/transactions?status=waiting_confirmation"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    status === 'waiting_confirmation'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Menunggu Konfirmasi
                </Link>
                <Link 
                  href="/admin/transactions?status=confirmed"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    status === 'confirmed'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dikonfirmasi
                </Link>
                <Link 
                  href="/admin/transactions?status=rejected"
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    status === 'rejected'
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Ditolak
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Transaksi ({totalCount})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const StatusIcon = getStatusIcon(transaction.status)
                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">
                          {transaction.id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.event.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.user.name}</div>
                        <div className="text-sm text-gray-500">{transaction.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.finalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{getStatusText(transaction.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDateTime(transaction.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          href={`/admin/transactions/${transaction.id}`}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Detail</span>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {transactions.length === 0 && (
              <div className="px-6 py-8">
                {status ? (
                  <NoSearchResults searchTerm={`status "${getStatusText(status.toUpperCase())}"`} />
                ) : (
                  <NoTransactionsFound />
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} dari {totalCount} transaksi
                </div>
                
                <div className="flex items-center space-x-2">
                  {page > 1 && (
                    <Link 
                      href={`/admin/transactions?${new URLSearchParams({ 
                        ...(status && { status }), 
                        page: (page - 1).toString() 
                      })}`}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      Previous
                    </Link>
                  )}
                  
                  <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded">
                    {page}
                  </span>
                  
                  {page < totalPages && (
                    <Link 
                      href={`/admin/transactions?${new URLSearchParams({ 
                        ...(status && { status }), 
                        page: (page + 1).toString() 
                      })}`}
                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
