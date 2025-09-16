'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Users, 
  Calendar, 
  CreditCard, 
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface AdminDashboardProps {
  data: {
    stats: {
      totalUsers: number
      totalEvents: number
      totalTransactions: number
      totalRevenue: number
      usersByRole: Record<string, number>
      transactionsByStatus: Record<string, number>
    }
    pendingTransactions: Array<{
      id: string
      finalAmount: number
      createdAt: Date
      paymentProof: string | null
      user: {
        name: string
        email: string
      }
      event: {
        title: string
      }
    }>
    recentEvents: Array<{
      id: string
      title: string
      startDate: Date
      location: string
      organizer: {
        name: string
      }
      category: {
        name: string
      }
      _count: {
        transactions: number
      }
    }>
    recentUsers: Array<{
      id: string
      name: string
      email: string
      role: string
      createdAt: Date
      isEmailVerified: boolean
    }>
  }
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'ORGANIZER':
        return 'bg-purple-100 text-purple-800'
      case 'CUSTOMER':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transaksi', icon: CreditCard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Kelola platform event management
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/admin/reports"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Laporan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{data.stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-xs text-gray-500 mt-1">
                  Admin: {data.stats.usersByRole.ADMIN || 0} | 
                  Organizer: {data.stats.usersByRole.ORGANIZER || 0} | 
                  Customer: {data.stats.usersByRole.CUSTOMER || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{data.stats.totalEvents.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{data.stats.totalTransactions.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Transaksi</div>
                <div className="text-xs text-gray-500 mt-1">
                  Pending: {data.stats.transactionsByStatus.WAITING_CONFIRMATION || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(data.stats.totalRevenue)}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link 
                      href="/admin/transactions?status=waiting_confirmation"
                      className="p-4 border-2 border-dashed border-yellow-300 rounded-lg hover:border-yellow-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium text-gray-900">Konfirmasi Pembayaran</div>
                          <div className="text-sm text-gray-600">{data.pendingTransactions.length} pending</div>
                        </div>
                      </div>
                    </Link>

                    <Link 
                      href="/admin/events"
                      className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="font-medium text-gray-900">Kelola Events</div>
                          <div className="text-sm text-gray-600">Moderasi & Review</div>
                        </div>
                      </div>
                    </Link>

                    <Link 
                      href="/admin/users"
                      className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-gray-900">Kelola Users</div>
                          <div className="text-sm text-gray-600">Verifikasi & Role</div>
                        </div>
                      </div>
                    </Link>

                    <Link 
                      href="/admin/reports"
                      className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-gray-900">Lihat Laporan</div>
                          <div className="text-sm text-gray-600">Analytics & Stats</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Transactions */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Transaksi Menunggu Konfirmasi
                      </h3>
                      <Link 
                        href="/admin/transactions?status=waiting_confirmation"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Lihat Semua
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {data.pendingTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">{transaction.event.title}</div>
                            <div className="font-semibold text-blue-600">{formatCurrency(transaction.finalAmount)}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">{transaction.user.name}</div>
                            <Link 
                              href={`/admin/transactions/${transaction.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Review
                            </Link>
                          </div>
                        </div>
                      ))}
                      {data.pendingTransactions.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Tidak ada transaksi yang menunggu konfirmasi
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Events */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Event Terbaru
                      </h3>
                      <Link 
                        href="/admin/events"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Lihat Semua
                      </Link>
                    </div>
                    <div className="space-y-3">
                      {data.recentEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                              {event.category.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              by {event.organizer.name} • {event._count.transactions} peserta
                            </div>
                            <Link 
                              href={`/admin/events/${event.id}`}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Detail
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manajemen Transaksi
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/admin/transactions"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lihat Semua Transaksi
                    </Link>
                  </div>
                </div>

                {/* Transaction Status Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(data.stats.transactionsByStatus).map(([status, count]) => (
                    <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{count}</div>
                      <div className={`text-xs font-medium mt-1 px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pending Transactions Table */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Transaksi Menunggu Konfirmasi ({data.pendingTransactions.length})
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {data.pendingTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{transaction.event.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{transaction.user.name}</div>
                              <div className="text-sm text-gray-500">{transaction.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.finalAmount)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(transaction.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Link 
                                href={`/admin/transactions/${transaction.id}`}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Review</span>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.pendingTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Tidak ada transaksi yang menunggu konfirmasi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manajemen Events
                  </h3>
                  <Link 
                    href="/admin/events"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Semua Events
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Organizer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participants
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.recentEvents.map((event) => (
                        <tr key={event.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{event.title}</div>
                                <div className="text-sm text-gray-500">{event.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{event.organizer.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(event.startDate)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{event._count.transactions} peserta</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/admin/events/${event.id}`}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Detail</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manajemen Users
                  </h3>
                  <Link 
                    href="/admin/users"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Semua Users
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.recentUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isEmailVerified ? (
                              <span className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Verified</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-yellow-600">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-sm">Unverified</span>
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link 
                              href={`/admin/users/${user.id}`}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                              <span>Detail</span>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Platform Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Pengaturan Umum</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Platform Maintenance Mode</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                          <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Auto-approve Events</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Notifications</span>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                          <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Pembayaran</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Payment Deadline (hours)</span>
                        <input 
                          type="number" 
                          defaultValue="2" 
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Max File Size (MB)</span>
                        <input 
                          type="number" 
                          defaultValue="5" 
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Simpan Pengaturan
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Reset ke Default
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
