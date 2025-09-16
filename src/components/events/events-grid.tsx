'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Star, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  price: number
  isFree: boolean
  thumbnail: string | null
  availableSeats: number
  totalSeats: number
  organizer: {
    id: string
    name: string
    profileImage: string | null
  }
  category: {
    id: string
    name: string
  }
  averageRating: number
  totalParticipants: number
}

interface EventsData {
  events: Event[]
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    hasNextPage: boolean
    hasPrevPage: boolean
    limit: number
  }
}

export function EventsGrid() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<EventsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError('')
      
      try {
        const params = new URLSearchParams(searchParams.toString())
        const response = await fetch(`/api/events?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const result = await response.json()
        setData(result)
      } catch (error) {
        setError('Gagal memuat event. Silakan coba lagi.')
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [searchParams])

  if (loading) {
    return <EventsGridSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  if (!data || data.events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tidak ada event ditemukan
        </h3>
        <p className="text-gray-600">
          Coba ubah filter atau kata kunci pencarian Anda
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Results header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {data.pagination.totalCount} Event Ditemukan
          </h2>
          <p className="text-sm text-gray-600">
            Halaman {data.pagination.currentPage} dari {data.pagination.totalPages}
          </p>
        </div>
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <Pagination pagination={data.pagination} />
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const seatPercentage = ((event.totalSeats - event.availableSeats) / event.totalSeats) * 100
  const isAlmostFull = seatPercentage >= 80
  const isSoldOut = event.availableSeats === 0

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
      {/* Event Image */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center relative">
        <Calendar className="h-16 w-16 text-white" />
        {isSoldOut && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              SOLD OUT
            </span>
          </div>
        )}
        {isAlmostFull && !isSoldOut && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
              Hampir Penuh
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Category and Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {event.category.name}
          </span>
          {event.averageRating > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{event.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Event Info */}
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>{new Date(event.startDate).toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 flex-shrink-0" />
            <span>{event.availableSeats} seat tersisa</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
            {event.organizer.profileImage ? (
              <img 
                src={event.organizer.profileImage} 
                alt={event.organizer.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <Users className="h-3 w-3 text-gray-600" />
            )}
          </div>
          <span className="text-sm text-gray-600 truncate">{event.organizer.name}</span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-lg font-semibold text-blue-600">
            {event.isFree ? 'GRATIS' : formatCurrency(event.price)}
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/events/${event.id}`}
          className={`block w-full text-center py-2 rounded-lg font-medium transition-colors ${
            isSoldOut
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSoldOut ? 'Sold Out' : 'Lihat Detail'}
        </Link>
      </div>
    </div>
  )
}

function Pagination({ pagination }: { pagination: EventsData['pagination'] }) {
  const { currentPage, totalPages, hasPrevPage, hasNextPage } = pagination

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search)
    params.set('page', page.toString())
    return `/events?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Menampilkan halaman {currentPage} dari {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        {hasPrevPage && (
          <Link
            href={getPageUrl(currentPage - 1)}
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Sebelumnya</span>
          </Link>
        )}
        
        {hasNextPage && (
          <Link
            href={getPageUrl(currentPage + 1)}
            className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  )
}

function EventsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
