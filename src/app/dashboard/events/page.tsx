import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Calendar, 
  Plus, 
  Users, 
  TrendingUp, 
  Settings,
  DollarSign,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'

export default async function OrganizerDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  // Fetch organizer's events and stats
  const [events, stats] = await Promise.all([
    prisma.event.findMany({
      where: {
        organizerId: session.user.id,
        isActive: true,
      },
      include: {
        category: true,
        _count: {
          select: {
            transactions: {
              where: { status: 'CONFIRMED' }
            }
          }
        },
        transactions: {
          where: { status: 'CONFIRMED' },
          select: {
            finalAmount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.event.groupBy({
      by: ['organizerId'],
      where: {
        organizerId: session.user.id,
        isActive: true,
      },
      _count: {
        id: true
      },
      _sum: {
        price: true
      }
    })
  ])

  // Calculate revenue
  const totalRevenue = events.reduce((sum, event) => {
    return sum + event.transactions.reduce((eventSum, transaction) => {
      return eventSum + transaction.finalAmount
    }, 0)
  }, 0)

  const totalEvents = events.length
  const totalTicketsSold = events.reduce((sum, event) => sum + event._count.transactions, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Organizer
              </h1>
              <p className="text-gray-600 mt-2">
                Kelola event dan lihat performa Anda
              </p>
            </div>
            <Link
              href="/dashboard/events/create"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Event Baru
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Event</p>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiket Terjual</p>
                <p className="text-2xl font-bold text-gray-900">{totalTicketsSold}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata/Event</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalEvents > 0 ? totalRevenue / totalEvents : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Event Saya</h2>
              <Link
                href="/dashboard/transactions"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua Transaksi →
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Event
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat event pertama Anda
              </p>
              <Link
                href="/dashboard/events/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Event Pertama
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiket Terjual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => {
                    const eventRevenue = event.transactions.reduce((sum, t) => sum + t.finalAmount, 0)
                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.category.name} • {event.location}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(event.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {event._count.transactions} tiket
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(eventRevenue)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/events/${event.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/dashboard/events/${event.id}/edit`}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
