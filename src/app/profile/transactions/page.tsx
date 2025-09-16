import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionsList } from '@/components/profile/transactions-list'

interface TransactionsPageProps {
  searchParams: {
    page?: string
    status?: string
  }
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const page = parseInt(searchParams.page || '1')
  const status = searchParams.status
  const limit = 10
  const skip = (page - 1) * limit

  const where: any = {
    userId: session.user.id,
  }

  if (status && status !== 'all') {
    where.status = status.toUpperCase()
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        transactionTickets: {
          include: {
            ticketType: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        pointTransactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  const data = {
    transactions: transactions.map(transaction => ({
      ...transaction,
      pointsUsed: transaction.pointTransactions
        .filter(pt => pt.points < 0)
        .reduce((sum, pt) => sum + Math.abs(pt.points), 0),
      voucherDiscount: 0, // Can be calculated if you have voucher relation
      couponDiscount: 0, // Can be calculated if you have coupon relation
      tickets: transaction.transactionTickets.map(tt => ({
        quantity: tt.quantity,
        ticketType: tt.ticketType,
      })),
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    },
  }

  return <TransactionsList data={data} currentStatus={status || 'all'} />
}
