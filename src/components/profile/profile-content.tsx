'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { 
  User, 
  Calendar, 
  CreditCard, 
  Star, 
  Users, 
  Settings, 
  LogOut,
  Edit3,
  Trophy,
  Gift,
  Eye,
  MapPin,
  Clock,
  Ticket
} from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface ProfileContentProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    profileImage: string | null
    referralNumber: string
    referredBy: string | null
    points: number
    isEmailVerified: boolean
    createdAt: Date
    transactions: Array<{
      id: string
      totalAmount: number
      finalAmount: number
      status: string
      createdAt: Date
      event: {
        id: string
        title: string
        startDate: Date
        location: string
      }
      tickets: Array<{
        quantity: number
        ticketType: {
          name: string
          price: number
        }
      }>
    }>
    pointTransactions: Array<{
      id: string
      points: number
      type: string
      description: string
      createdAt: Date
    }>
    reviews: Array<{
      id: string
      rating: number
      comment: string
      createdAt: Date
      event: {
        id: string
        title: string
      }
    }>
    organizedEvents: Array<{
      id: string
      title: string
      startDate: Date
      location: string
      _count: {
        transactions: number
      }
    }>
    referrals: Array<{
      id: string
      name: string
      email: string
      createdAt: Date
    }>
    stats: {
      totalTransactions: number
      totalReviews: number
      totalEventsOrganized: number
      totalReferrals: number
      totalSpent: number
    }
    referrer?: {
      name: string
      email: string
    } | null
  }
}

export function ProfileContent({ user }: ProfileContentProps) {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('overview')

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
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

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'EARNED_REFERRAL':
        return 'text-green-600'
      case 'USED_PURCHASE':
        return 'text-red-600'
      case 'EXPIRED':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPointTypeText = (type: string) => {
    switch (type) {
      case 'EARNED_REFERRAL':
        return 'Earned from Referral'
      case 'USED_PURCHASE':
        return 'Used for Purchase'
      case 'EXPIRED':
        return 'Expired'
      default:
        return type
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'transactions', label: 'Transaksi', icon: CreditCard },
    { id: 'points', label: 'Poin', icon: Trophy },
    { id: 'reviews', label: 'Review', icon: Star },
    ...(user.role === 'ORGANIZER' ? [{ id: 'events', label: 'Event Saya', icon: Calendar }] : []),
    { id: 'referrals', label: 'Referral', icon: Users },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                {user.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'ORGANIZER' ? 'Organizer' : 'Customer'}
                  </span>
                  {user.isEmailVerified ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Email Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Email Not Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {user.points.toLocaleString()} <span className="text-sm font-normal text-gray-600">poin</span>
              </div>
              <p className="text-sm text-gray-600">Bergabung {formatDate(user.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.totalTransactions}</div>
                <div className="text-sm text-gray-600">Total Transaksi</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(user.stats.totalSpent)}</div>
                <div className="text-sm text-gray-600">Total Pengeluaran</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.totalReviews}</div>
                <div className="text-sm text-gray-600">Review Diberikan</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.totalReferrals}</div>
                <div className="text-sm text-gray-600">Referral Berhasil</div>
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Referral Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Kode Referral Anda
                    </h3>
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <code className="text-lg font-mono font-bold text-blue-600">
                          {user.referralNumber}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(user.referralNumber)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Bagikan kode ini untuk mendapatkan poin dari setiap referral yang berhasil!
                      </p>
                    </div>
                  </div>

                  {/* Referred By */}
                  {user.referrer && (
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Direferensikan Oleh
                      </h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.referrer.name}</div>
                          <div className="text-sm text-gray-600">{user.referrer.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Aktivitas Terbaru
                  </h3>
                  <div className="space-y-3">
                    {user.transactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Ticket className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{transaction.event.title}</div>
                            <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(transaction.finalAmount)}</div>
                          <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {user.transactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada transaksi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Riwayat Transaksi
                  </h3>
                  <Link 
                    href="/profile/transactions"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Lihat Semua
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {user.transactions.map((transaction) => (
                    <div key={transaction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{transaction.event.title}</div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(transaction.event.startDate)} • {transaction.event.location}
                            </div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {transaction.tickets.map((ticket, index) => (
                            <span key={index}>
                              {ticket.quantity}x {ticket.ticketType.name}
                              {index < transaction.tickets.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">{formatCurrency(transaction.finalAmount)}</div>
                          <Link 
                            href={`/transactions/${transaction.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Lihat Detail
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {user.transactions.length === 0 && (
                    <div className="text-center py-12">
                      <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada transaksi
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Mulai jelajahi event menarik dan beli tiket pertama Anda!
                      </p>
                      <Link 
                        href="/events"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Jelajahi Event
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Points Tab */}
            {activeTab === 'points' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Saldo Poin Anda</h3>
                      <p className="text-gray-600">1 poin = Rp 1 diskon</p>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {user.points.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Riwayat Poin
                  </h3>
                  <div className="space-y-3">
                    {user.pointTransactions.map((pointTx) => (
                      <div key={pointTx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            pointTx.points > 0 ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {pointTx.points > 0 ? (
                              <Gift className="h-5 w-5 text-green-600" />
                            ) : (
                              <CreditCard className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{pointTx.description}</div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(pointTx.createdAt)} • {getPointTypeText(pointTx.type)}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${getPointTypeColor(pointTx.type)}`}>
                          {pointTx.points > 0 ? '+' : ''}{pointTx.points.toLocaleString()}
                        </div>
                      </div>
                    ))}
                    
                    {user.pointTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada aktivitas poin
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Review yang Anda Berikan
                </h3>
                
                <div className="space-y-4">
                  {user.reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Link 
                          href={`/events/${review.event.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {review.event.title}
                        </Link>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                    </div>
                  ))}
                  
                  {user.reviews.length === 0 && (
                    <div className="text-center py-12">
                      <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada review
                      </h3>
                      <p className="text-gray-600">
                        Berikan review untuk event yang sudah Anda hadiri
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Events Tab (for Organizers) */}
            {activeTab === 'events' && user.role === 'ORGANIZER' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Event yang Anda Selenggarakan
                  </h3>
                  <Link 
                    href="/organizer/events/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Buat Event Baru
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {user.organizedEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-600">
                              {formatDateTime(event.startDate)} • {event.location}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {event._count.transactions} peserta
                          </div>
                          <Link 
                            href={`/organizer/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Kelola Event
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {user.organizedEvents.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum ada event
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Mulai buat event pertama Anda dan kelola peserta dengan mudah
                      </p>
                      <Link 
                        href="/organizer/events/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Buat Event Baru
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Program Referral
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ajak teman untuk bergabung dan dapatkan poin untuk setiap referral yang berhasil!
                  </p>
                  <div className="bg-white rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {user.stats.totalReferrals}
                      </div>
                      <div className="text-sm text-gray-600">Total Referral Berhasil</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Referral Anda
                  </h3>
                  <div className="space-y-3">
                    {user.referrals.map((referral) => (
                      <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{referral.name}</div>
                            <div className="text-sm text-gray-600">{referral.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(referral.createdAt)}
                        </div>
                      </div>
                    ))}
                    
                    {user.referrals.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Belum ada referral yang berhasil
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pengaturan Akun
                  </h3>
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Edit Profil</div>
                          <div className="text-sm text-gray-600">Ubah nama, email, dan foto profil</div>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">Ubah Password</div>
                          <div className="text-sm text-gray-600">Ganti password akun Anda</div>
                        </div>
                        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <Settings className="h-4 w-4" />
                          <span>Ubah</span>
                        </button>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-red-600">Keluar</div>
                          <div className="text-sm text-gray-600">Keluar dari akun Anda</div>
                        </div>
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
