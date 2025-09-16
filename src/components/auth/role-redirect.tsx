'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { UserRole } from '@prisma/client'

interface RoleRedirectProps {
  children: React.ReactNode
}

export function RoleRedirect({ children }: RoleRedirectProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (session?.user?.role === UserRole.ORGANIZER) {
      router.push('/dashboard/events')
      return
    }

    if (session?.user?.role === UserRole.ADMIN) {
      router.push('/admin')
      return
    }

    // For customers and unauthenticated users, show the homepage
  }, [session, status, router])

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render children if redirecting organizer/admin
  if (session?.user?.role === UserRole.ORGANIZER || session?.user?.role === UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
