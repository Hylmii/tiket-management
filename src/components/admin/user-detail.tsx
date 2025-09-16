'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Mail, Calendar, CreditCard } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface UserDetailProps {
  userId: string
}

interface UserData {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
  updatedAt: Date
  transactions: Array<{
    id: string
    status: string
    finalAmount: number
    createdAt: Date
    event: {
      title: string
    }
  }>
  _count: {
    transactions: number
  }
}

export function UserDetailComponent({ userId }: UserDetailProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user')
        }
        const userData = await response.json()
        setUser(userData)
      } catch (err) {
        setError('Failed to load user data')
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">{error || 'User not found'}</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Users</span>
          </Link>
        </div>
      </div>
    )
  }

  const totalSpent = user.transactions
    .filter(t => t.status === 'CONFIRMED')
    .reduce((sum, t) => sum + t.finalAmount, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/users"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Users</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">
          User Detail
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Role</div>
                <div className="font-medium text-gray-900 capitalize">{user.role}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Member Since</div>
                <div className="font-medium text-gray-900 flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
                <div className="font-medium text-gray-900">{user._count.transactions}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Spent</div>
                <div className="font-medium text-green-600">{formatCurrency(totalSpent)}</div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            
            {user.transactions.length > 0 ? (
              <div className="space-y-4">
                {user.transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.event.title}</div>
                      <div className="text-sm text-gray-600">{formatDate(transaction.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(transaction.finalAmount)}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'WAITING_CONFIRMATION' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No transactions found</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold text-gray-900">{user._count.transactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Confirmed</span>
                <span className="font-semibold text-green-600">
                  {user.transactions.filter(t => t.status === 'CONFIRMED').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {user.transactions.filter(t => t.status === 'WAITING_CONFIRMATION').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
