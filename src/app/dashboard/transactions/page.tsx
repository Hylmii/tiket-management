import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { TransactionManagement } from '@/components/dashboard/transaction-management'

export default async function TransactionManagementPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  // Fetch transactions for organizer's events
  const transactions = await prisma.transaction.findMany({
    where: {
      event: {
        organizerId: session.user.id
      }
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      transactionTickets: {
        include: {
          ticketType: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <TransactionManagement transactions={transactions} />
}
