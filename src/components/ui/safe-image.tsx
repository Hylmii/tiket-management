'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FileImage } from 'lucide-react'

interface SafeImageProps {
  src: string | null
  alt: string
  width: number
  height: number
  className?: string
  fallbackText?: string
  onClick?: () => void
}

export function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = '', 
  fallbackText = 'Gambar tidak tersedia',
  onClick 
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
        style={{ width, height }}
        onClick={onClick}
      >
        <div className="text-center text-gray-500">
          <FileImage className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">{fallbackText}</p>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onClick={onClick}
      onError={() => setHasError(true)}
    />
  )
}
