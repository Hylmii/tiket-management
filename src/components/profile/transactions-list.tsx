'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard, 
  ArrowLeft, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Eye
} from 'lucide-react'
import { formatCurrency, formatDateTime, formatDate } from '@/lib/utils'

interface TransactionsListProps {
  data: {
    transactions: Array<{
      id: string
      totalAmount: number
      pointsUsed: number
      voucherDiscount: number
      couponDiscount: number
      finalAmount: number
      status: string
      createdAt: Date
      event: {
        id: string
        title: string
        startDate: Date
        location: string
        category: {
          name: string
        }
      }
      tickets: Array<{
        quantity: number
        ticketType: {
          name: string
          price: number
        }
      }>
      voucher?: {
        code: string
      } | null
      coupon?: {
        code: string
      } | null
    }>
    pagination: {
      currentPage: number
      totalPages: number
      totalCount: number
      hasNextPage: boolean
      hasPrevPage: boolean
      limit: number
    }
  }
  currentStatus: string
}

export function TransactionsList({ data, currentStatus }: TransactionsListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    params.delete('page') // Reset to first page when filtering
    router.push(`/profile/transactions?${params.toString()}`)
  }

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `/profile/transactions?${params.toString()}`
  }

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: 'waiting_payment', label: 'Menunggu Pembayaran' },
    { value: 'waiting_confirmation', label: 'Menunggu Konfirmasi' },
    { value: 'confirmed', label: 'Dikonfirmasi' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'expired', label: 'Kadaluarsa' },
    { value: 'canceled', label: 'Dibatalkan' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                Riwayat Transaksi
              </h1>
              <p className="text-gray-600">
                {data.pagination.totalCount} transaksi ditemukan
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Status</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentStatus === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4 mb-8">
          {data.transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-xl shadow-sm p-6">
              {/* Transaction Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Ticket className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{transaction.event.title}</div>
                    <div className="text-sm text-gray-600">
                      ID: {transaction.id}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                    {getStatusText(transaction.status)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Tanggal Event</div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(transaction.event.startDate)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Lokasi</div>
                    <div className="text-sm text-gray-600">{transaction.event.location}</div>
                  </div>
                </div>
              </div>

              {/* Ticket Details */}
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-900 mb-2">Detail Tiket</div>
                <div className="space-y-1">
                  {transaction.tickets.map((ticket, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {ticket.quantity}x {ticket.ticketType.name}
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(ticket.quantity * ticket.ticketType.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatCurrency(transaction.totalAmount)}</span>
                    </div>
                    
                    {transaction.pointsUsed > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon Poin</span>
                        <span>-{formatCurrency(transaction.pointsUsed)}</span>
                      </div>
                    )}
                    
                    {transaction.couponDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon Kupon {transaction.coupon && `(${transaction.coupon.code})`}</span>
                        <span>-{formatCurrency(transaction.couponDiscount)}</span>
                      </div>
                    )}
                    
                    {transaction.voucherDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Diskon Voucher {transaction.voucher && `(${transaction.voucher.code})`}</span>
                        <span>-{formatCurrency(transaction.voucherDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between font-semibold text-blue-600 border-t border-gray-200 pt-2">
                      <span>Total Bayar</span>
                      <span>{formatCurrency(transaction.finalAmount)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Link 
                      href={`/transactions/${transaction.id}`}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Lihat Detail</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {data.transactions.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Tidak ada transaksi ditemukan
              </h3>
              <p className="text-gray-600 mb-6">
                {currentStatus === 'all' 
                  ? 'Anda belum melakukan transaksi apapun'
                  : `Tidak ada transaksi dengan status "${statusOptions.find(opt => opt.value === currentStatus)?.label}"`
                }
              </p>
              <Link 
                href="/events"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Jelajahi Event
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data.pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Menampilkan halaman {data.pagination.currentPage} dari {data.pagination.totalPages}
                ({data.pagination.totalCount} total transaksi)
              </div>
              
              <div className="flex items-center space-x-2">
                {data.pagination.hasPrevPage && (
                  <Link
                    href={getPageUrl(data.pagination.currentPage - 1)}
                    className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Sebelumnya</span>
                  </Link>
                )}
                
                {data.pagination.hasNextPage && (
                  <Link
                    href={getPageUrl(data.pagination.currentPage + 1)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
