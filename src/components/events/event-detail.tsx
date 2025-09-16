'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Users, Star, ArrowLeft, Share2, Heart } from 'lucide-react'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface EventDetailProps {
  event: {
    id: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    location: string
    price: number
    isFree: boolean
    thumbnail: string | null
    organizer: {
      id: string
      name: string
      email: string
      profileImage: string | null
    }
    category: {
      id: string
      name: string
    }
    ticketTypes: Array<{
      id: string
      name: string
      price: number
      quantity: number
      description: string | null
    }>
    reviews: Array<{
      id: string
      rating: number
      comment: string
      createdAt: Date
      user: {
        name: string
        profileImage: string | null
      }
    }>
    averageRating: number
    totalSeats: number
    availableSeats: number
    totalParticipants: number
  }
}

export function EventDetail({ event }: EventDetailProps) {
  const { data: session } = useSession()
  const [selectedTicketType, setSelectedTicketType] = useState(event.ticketTypes[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const isEventPassed = new Date(event.endDate) < new Date()
  const isEventSoldOut = event.availableSeats <= 0
  const canPurchase = !isEventPassed && !isEventSoldOut && event.ticketTypes.length > 0

  const selectedTicket = event.ticketTypes.find(t => t.id === selectedTicketType)
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link berhasil disalin ke clipboard!')
    }
  }

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted)
    // TODO: Implement wishlist API call
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/events"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Kembali ke Events</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleWishlist}
                className={`p-2 rounded-full border transition-colors ${
                  isWishlisted 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            {/* Event Image */}
            <div className="h-64 md:h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-8 flex items-center justify-center">
              <Calendar className="h-24 w-24 text-white" />
            </div>

            {/* Event Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              {/* Category and Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {event.category.name}
                </span>
                <div className="flex items-center space-x-4">
                  {event.averageRating > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">
                        {event.averageRating.toFixed(1)} ({event.reviews.length} review)
                      </span>
                    </div>
                  )}
                  {isEventSoldOut && (
                    <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                      SOLD OUT
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>

              {/* Event Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(event.startDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(event.startDate).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(event.endDate).toLocaleTimeString('id-ID', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Lokasi</div>
                    <div className="text-sm text-gray-600">{event.location}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Kapasitas</div>
                    <div className="text-sm text-gray-600">
                      {event.availableSeats} tersisa dari {event.totalSeats} seat
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">Status</div>
                    <div className="text-sm text-gray-600">
                      {isEventPassed ? 'Event telah berakhir' : 'Event akan datang'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Deskripsi Event
                </h2>
                <div className="prose max-w-none text-gray-600">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Penyelenggara
              </h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {event.organizer.profileImage ? (
                    <img 
                      src={event.organizer.profileImage} 
                      alt={event.organizer.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <Users className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{event.organizer.name}</div>
                  <div className="text-sm text-gray-600">{event.organizer.email}</div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {event.reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Review ({event.reviews.length})
                </h2>
                <div className="space-y-4">
                  {event.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {review.user.profileImage ? (
                            <img 
                              src={review.user.profileImage} 
                              alt={review.user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">{review.user.name}</span>
                            <div className="flex items-center">
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
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <span className="text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {event.isFree ? 'GRATIS' : formatCurrency(event.price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {event.availableSeats} seat tersisa
                  </div>
                </div>

                {canPurchase ? (
                  <div className="space-y-4">
                    {/* Ticket Type Selection */}
                    {event.ticketTypes.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipe Tiket
                        </label>
                        <select
                          value={selectedTicketType}
                          onChange={(e) => setSelectedTicketType(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {event.ticketTypes.map((ticket) => (
                            <option key={ticket.id} value={ticket.id}>
                              {ticket.name} - {formatCurrency(ticket.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Quantity Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jumlah Tiket
                      </label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({ length: Math.min(5, event.availableSeats) }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            {num} tiket
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Total Price */}
                    {selectedTicket && !selectedTicket.price === false && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                          <span>Total:</span>
                          <span className="text-blue-600">
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {session ? (
                      <Link
                        href={`/events/${event.id}/checkout?ticketType=${selectedTicketType}&quantity=${quantity}`}
                        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Beli Tiket Sekarang
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="/auth/signin"
                          className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Login untuk Beli Tiket
                        </Link>
                        <p className="text-xs text-gray-600 text-center">
                          Belum punya akun? <Link href="/auth/signup" className="text-blue-600 hover:underline">Daftar di sini</Link>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    {isEventPassed ? (
                      <div className="bg-gray-100 text-gray-600 py-3 rounded-lg">
                        Event telah berakhir
                      </div>
                    ) : isEventSoldOut ? (
                      <div className="bg-red-100 text-red-600 py-3 rounded-lg">
                        Tiket Sold Out
                      </div>
                    ) : (
                      <div className="bg-gray-100 text-gray-600 py-3 rounded-lg">
                        Tiket tidak tersedia
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
