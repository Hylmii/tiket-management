import Link from 'next/link'
import { Calendar, Users, Star, Search, Sparkles, TrendingUp, Shield } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { RoleRedirect } from '@/components/auth/role-redirect'

export default async function HomePage() {
  // Fetch featured events (upcoming events with high ratings)
  const featuredEvents = await prisma.event.findMany({
    where: {
      isActive: true,
      startDate: {
        gte: new Date(),
      },
    },
    include: {
      organizer: {
        select: { name: true }
      },
      category: {
        select: { name: true }
      },
      reviews: {
        select: { rating: true }
      },
      _count: {
        select: { transactions: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 6
  })

  // Get stats
  const stats = await Promise.all([
    prisma.event.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'ORGANIZER' } }),
    prisma.transaction.count({ where: { status: 'CONFIRMED' } })
  ])

  const [totalEvents, totalUsers, totalOrganizers, totalTickets] = stats

  return (
    <RoleRedirect>
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Temukan Event
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                  Terbaik Untukmu
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Platform event management terpercaya di Indonesia. Jelajahi ribuan event menarik, 
                beli tiket dengan mudah, dan rasakan pengalaman tak terlupakan.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/events" 
                className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Jelajahi Event Sekarang
              </Link>
              <Link 
                href="/auth/signup?role=organizer" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-all duration-300"
              >
                Menjadi Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{totalEvents.toLocaleString('id-ID')}</div>
              <div className="text-gray-600 mt-2">Event Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{totalUsers.toLocaleString('id-ID')}</div>
              <div className="text-gray-600 mt-2">Pengguna</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{totalOrganizers.toLocaleString('id-ID')}</div>
              <div className="text-gray-600 mt-2">Organizer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{totalTickets.toLocaleString('id-ID')}</div>
              <div className="text-gray-600 mt-2">Tiket Terjual</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Event Pilihan
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan event-event terbaik yang telah dipilih khusus untuk Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents.map((event) => {
              const averageRating = event.reviews.length > 0 
                ? event.reviews.reduce((acc, review) => acc + review.rating, 0) / event.reviews.length
                : 0
              
              return (
                <div key={event.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <Calendar className="h-16 w-16 text-white" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {event.category.name}
                      </span>
                      {averageRating > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>📅 {new Date(event.startDate).toLocaleDateString('id-ID')}</div>
                      <div>📍 {event.location}</div>
                      <div className="text-lg font-semibold text-blue-600">
                        {event.isFree ? 'GRATIS' : `Rp ${event.price.toLocaleString('id-ID')}`}
                      </div>
                    </div>
                    <Link 
                      href={`/events/${event.id}`}
                      className="mt-4 block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lihat Detail
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-center">
            <Link 
              href="/events" 
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <span>Lihat Semua Event</span>
              <TrendingUp className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih EventHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pengalaman terbaik untuk mencari dan mengelola event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pembayaran Aman</h3>
              <p className="text-gray-600">
                Sistem pembayaran dengan verifikasi manual yang aman dan terpercaya. 
                Uang Anda dilindungi hingga event selesai.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sistem Poin & Referral</h3>
              <p className="text-gray-600">
                Dapatkan poin setiap referral dan gunakan untuk diskon pembelian tiket. 
                Semakin aktif, semakin hemat!
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Komunitas Aktif</h3>
              <p className="text-gray-600">
                Bergabung dengan ribuan pengguna aktif. Review dan rating membantu 
                Anda memilih event berkualitas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Memulai Perjalanan Event Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ribuan orang yang telah menemukan event impian mereka
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signup" 
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              Daftar Sekarang
            </Link>
            <Link 
              href="/events" 
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-700 transition-colors"
            >
              Jelajahi Event
            </Link>
          </div>
        </div>
      </section>
    </div>
    </RoleRedirect>
  )
}
