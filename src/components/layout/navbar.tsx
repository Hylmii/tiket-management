'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Ticket,
  BarChart3,
  Settings,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            >
              Jelajahi Event
            </Link>
            
            {status === 'loading' ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* User-specific navigation */}
                {session.user.role === 'ORGANIZER' ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link 
                      href="/dashboard/events/create" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Buat Event
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/tickets" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Ticket className="h-4 w-4" />
                      <span>Tiket Saya</span>
                    </Link>
                    <div className="text-sm text-gray-600">
                      Points: <span className="font-semibold text-blue-600">{session.user.points.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}

                {/* User dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {session.user.profileImage ? (
                        <img 
                          src={session.user.profileImage} 
                          alt={session.user.name} 
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <span className="font-medium">{session.user.name}</span>
                  </button>

                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profil</span>
                      </Link>
                      
                      {session.user.role === UserRole.ADMIN && (
                        <>
                          <Link 
                            href="/admin" 
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                          <Link 
                            href="/dashboard/events" 
                            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Organizer Dashboard</span>
                          </Link>
                        </>
                      )}
                      
                      {session.user.role === UserRole.ORGANIZER && (
                        <Link 
                          href="/dashboard/events" 
                          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Calendar className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/signin" 
                  className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                >
                  Masuk
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden transition-all duration-300 overflow-hidden",
          isMenuOpen ? "max-h-96 pb-4" : "max-h-0"
        )}>
          <div className="space-y-2">
            <Link 
              href="/events" 
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
              onClick={toggleMenu}
            >
              Jelajahi Event
            </Link>
            
            {session ? (
              <>
                {session.user.role === 'ORGANIZER' ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/events/create" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={toggleMenu}
                    >
                      Buat Event
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/tickets" 
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={toggleMenu}
                    >
                      Tiket Saya
                    </Link>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Points: <span className="font-semibold text-blue-600">{session.user.points.toLocaleString('id-ID')}</span>
                    </div>
                  </>
                )}
                <Link 
                  href="/profile" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  Profil
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={toggleMenu}
                >
                  Masuk
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                  onClick={toggleMenu}
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
