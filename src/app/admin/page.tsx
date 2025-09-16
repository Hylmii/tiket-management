import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Get dashboard statistics
  const stats = await Promise.all([
    // Total users
    prisma.user.count(),
    
    // Total events
    prisma.event.count(),
    
    // Total transactions
    prisma.transaction.count(),
    
    // Revenue (confirmed transactions)
    prisma.transaction.aggregate({
      where: { status: 'CONFIRMED' },
      _sum: { finalAmount: true }
    }),
    
    // Users by role
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    }),
    
    // Transactions by status
    prisma.transaction.groupBy({
      by: ['status'],
      _count: { status: true }
    }),
    
    // Recent transactions needing confirmation
    prisma.transaction.findMany({
      where: { status: 'WAITING_CONFIRMATION' },
      include: {
        user: {
          select: { name: true, email: true }
        },
        event: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Recent events
    prisma.event.findMany({
      include: {
        organizer: {
          select: { name: true }
        },
        category: true,
        _count: {
          select: {
            transactions: {
              where: { status: 'CONFIRMED' }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    }),
    
    // Recent users
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        isEmailVerified: true
      }
    })
  ])

  const [
    totalUsers,
    totalEvents,
    totalTransactions,
    revenue,
    usersByRole,
    transactionsByStatus,
    pendingTransactions,
    recentEvents,
    recentUsers
  ] = stats

  const dashboardData = {
    stats: {
      totalUsers,
      totalEvents,
      totalTransactions,
      totalRevenue: revenue._sum.finalAmount || 0,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count.role
        return acc
      }, {} as Record<string, number>),
      transactionsByStatus: transactionsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count.status
        return acc
      }, {} as Record<string, number>)
    },
    pendingTransactions,
    recentEvents,
    recentUsers
  }

  return <AdminDashboard data={dashboardData} />
}
