import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { OrganizerTransactionDetail } from '@/components/dashboard/organizer-transaction-detail'

interface TransactionPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizerTransactionPage({ params }: TransactionPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  const { id } = await params

  const transaction = await prisma.transaction.findUnique({
    where: { 
      id,
      event: {
        organizerId: session.user.id, // Ensure organizer can only see their own event transactions
      },
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

  return <OrganizerTransactionDetail transaction={mappedTransaction} />
}
