import { Suspense } from 'react'
import { EventsGrid } from '@/components/events/events-grid'
import { EventsFilters } from '@/components/events/events-filters'
import { SearchBar } from '@/components/events/search-bar'
import { Calendar, Filter } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Jelajahi Event
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan event menarik di sekitar Anda. Dari workshop teknologi hingga konser musik, 
              semua ada di sini.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex items-center space-x-2 mb-6">
                <Filter className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Filter Event</h2>
              </div>
              <Suspense fallback={<div>Loading filters...</div>}>
                <EventsFilters />
              </Suspense>
            </div>
          </div>

          {/* Events Grid */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <Suspense fallback={<EventsGridSkeleton />}>
              <EventsGrid />
            </Suspense>
          </div>
        </div>
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
