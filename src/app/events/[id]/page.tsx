import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { EventDetail } from '@/components/events/event-detail'

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: EventPageProps) {
  const resolvedParams = await params
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    select: {
      title: true,
      description: true,
    },
  })

  if (!event) {
    return {
      title: 'Event Not Found',
    }
  }

  return {
    title: event.title,
    description: event.description,
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const resolvedParams = await params
  const event = await prisma.event.findUnique({
    where: { id: resolvedParams.id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      category: true,
      ticketTypes: {
        orderBy: {
          price: 'asc',
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              profileImage: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Calculate average rating
  const averageRating = event.reviews.length > 0
    ? event.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / event.reviews.length
    : 0

  // Calculate completed transactions count
  const completedTransactions = await prisma.transaction.count({
    where: {
      eventId: resolvedParams.id,
      status: 'CONFIRMED',
    },
  })

  // Calculate available seats from ticket types
  const totalSeats = event.ticketTypes.reduce((sum: number, ticket: any) => sum + ticket.available, 0)
  
  // Calculate sold tickets by counting confirmed transactions
  const soldTickets = await prisma.transaction.count({
    where: {
      eventId: resolvedParams.id,
      status: 'CONFIRMED',
    },
  })

  const availableSeats = totalSeats - soldTickets

  // Map ticket types to expected format
  const mappedTicketTypes = event.ticketTypes.map(ticket => ({
    id: ticket.id,
    name: ticket.name,
    price: ticket.price,
    quantity: ticket.available, // Map available to quantity
    description: ticket.description,
  }))

  // Map reviews to expected format
  const mappedReviews = event.reviews.map(review => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment || '', // Handle null comments
    createdAt: review.createdAt,
    user: review.user,
  }))

  const eventWithStats = {
    ...event,
    ticketTypes: mappedTicketTypes,
    reviews: mappedReviews,
    averageRating,
    totalSeats,
    availableSeats,
    totalParticipants: completedTransactions,
  }

  return <EventDetail event={eventWithStats} />
}
