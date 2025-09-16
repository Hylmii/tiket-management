import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TransactionDetail } from '@/components/transactions/transaction-detail'

interface TransactionPageProps {
  params: {
    id: string
  }
}

export default async function TransactionPage({ params }: TransactionPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const transaction = await prisma.transaction.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id, // Ensure user can only see their own transactions
    },
    include: {
      event: {
        include: {
          organizer: {
            select: {
              name: true,
              email: true,
            },
          },
          category: true,
        },
      },
      transactionTickets: {
        include: {
          ticketType: true,
        },
      },
      pointTransactions: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  if (!transaction) {
    notFound()
  }

  // Map transaction data to expected format
  const mappedTransaction = {
    ...transaction,
    pointsUsed: transaction.pointTransactions
      .filter(pt => pt.points < 0)
      .reduce((sum, pt) => sum + Math.abs(pt.points), 0),
    voucherDiscount: 0, // Can be calculated if you have voucher relation
    couponDiscount: 0, // Can be calculated if you have coupon relation
    adminNotes: null, // Add if you have this field
    tickets: transaction.transactionTickets.map(tt => ({
      id: tt.id,
      quantity: tt.quantity,
      unitPrice: tt.unitPrice,
      ticketType: {
        id: tt.ticketType.id,
        name: tt.ticketType.name,
        description: tt.ticketType.description,
      },
    })),
  }

  return <TransactionDetail transaction={mappedTransaction} />
}
