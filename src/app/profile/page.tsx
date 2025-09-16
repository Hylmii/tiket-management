import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ProfileContent } from '@/components/profile/profile-content'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Get user details with all related data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      transactions: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
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
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Get latest 10 transactions
      },
      pointTransactions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Get latest 10 point transactions
      },
      reviews: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // Get latest 5 reviews
      },
      organizedEvents: {
        select: {
          id: true,
          title: true,
          startDate: true,
          location: true,
          _count: {
            select: {
              transactions: {
                where: {
                  status: 'CONFIRMED',
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5, // Get latest 5 organized events
      },
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Get latest 10 referrals
      },
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Get user statistics
  const stats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      _count: {
        select: {
          transactions: {
            where: {
              status: 'CONFIRMED',
            },
          },
          reviews: true,
          organizedEvents: true,
          referrals: true,
        },
      },
    },
  })

  // Calculate total spent
  const totalSpent = await prisma.transaction.aggregate({
    where: {
      userId: session.user.id,
      status: 'CONFIRMED',
    },
    _sum: {
      finalAmount: true,
    },
  })

  // Get referrer info if user was referred
  const referrer = user.referredBy 
    ? await prisma.user.findUnique({
        where: { referralNumber: user.referredBy },
        select: {
          name: true,
          email: true,
        },
      })
    : null

  const userData = {
    ...user,
    transactions: user.transactions.map(transaction => ({
      ...transaction,
      tickets: transaction.transactionTickets.map(tt => ({
        quantity: tt.quantity,
        ticketType: tt.ticketType,
      })),
    })),
    reviews: user.reviews.map(review => ({
      ...review,
      comment: review.comment || '', // Handle null comments
    })),
    stats: {
      totalTransactions: stats?._count.transactions || 0,
      totalReviews: stats?._count.reviews || 0,
      totalEventsOrganized: stats?._count.organizedEvents || 0,
      totalReferrals: stats?._count.referrals || 0,
      totalSpent: totalSpent._sum.finalAmount || 0,
    },
    referrer,
  }

  return <ProfileContent user={userData} />
}
