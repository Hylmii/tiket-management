import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionDetail } from '@/components/admin/transaction-detail'

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const resolvedParams = await params

  const transaction = await prisma.transaction.findUnique({
    where: { id: resolvedParams.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          referralNumber: true
        }
      },
      event: {
        include: {
          organizer: {
            select: {
              name: true,
              email: true
            }
          },
          category: true
        }
      },
      transactionTickets: {
        include: {
          ticketType: true
        }
      },
      pointTransactions: true
    }
  })

  if (!transaction) {
    notFound()
  }

  // Map the data to match the expected interface
  const mappedTransaction = {
    ...transaction,
    user: {
      id: transaction.user.id,
      name: transaction.user.name,
      email: transaction.user.email,
      createdAt: transaction.user.createdAt,
    },
    event: {
      ...transaction.event,
      image: transaction.event.thumbnail, // map thumbnail to image
    },
    tickets: transaction.transactionTickets.map(tt => ({
      id: tt.id,
      quantity: tt.quantity,
      ticketType: {
        id: tt.ticketType.id,
        name: tt.ticketType.name,
        price: tt.ticketType.price,
        description: tt.ticketType.description,
      }
    })),
    pointsUsed: (transaction.pointTransactions || [])
      .filter(pt => pt.points < 0)
      .map(pt => ({
        id: pt.id,
        points: Math.abs(pt.points),
        description: pt.description
      })),
    referralUsed: null, // Add if you have referral data
    discountAmount: 0, // Calculate if you have discount data
  }

  return <TransactionDetail transaction={mappedTransaction} />
}
