'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, MapPin, DollarSign, Tag } from 'lucide-react'

const categories = [
  'Teknologi',
  'Bisnis', 
  'Pendidikan',
  'Hiburan',
  'Olahraga'
]

const locations = [
  'Jakarta',
  'Surabaya',
  'Bandung',
  'Yogyakarta',
  'Medan',
  'Online'
]

export function EventsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isFree: searchParams.get('isFree') === 'true'
  })

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Update URL parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString())
      } else {
        params.delete(key)
      }
    })
    
    // Reset to first page when filtering
    params.delete('page')
    
    const newUrl = `/events${params.toString() ? '?' + params.toString() : ''}`
    router.push(newUrl)
  }, [filters, router, searchParams])

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      minPrice: '',
      maxPrice: '',
      isFree: false
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  )

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Hapus Semua Filter
        </button>
      )}

      {/* Category Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Kategori</h3>
        </div>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Semua</span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Lokasi</h3>
        </div>
        <select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Semua Lokasi</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      {/* Date Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Tanggal</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Dari</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Sampai</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <DollarSign className="h-4 w-4 text-gray-600" />
          <h3 className="font-medium text-gray-900">Harga</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.isFree}
              onChange={(e) => handleFilterChange('isFree', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Event Gratis</span>
          </label>
          
          {!filters.isFree && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Harga Minimum</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Harga Maksimum</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="1000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
