import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const isFree = searchParams.get('isFree')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    // Build where clause
    const where: any = {
      isActive: true,
      startDate: {
        gte: new Date()
      }
    }

    // Search in title, description, or organizer name
    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          organizer: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Filter by category
    if (category) {
      where.category = {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      }
    }

    // Filter by location
    if (location) {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    // Filter by date range
    if (dateFrom) {
      where.startDate.gte = new Date(dateFrom)
    }
    if (dateTo) {
      where.startDate.lte = new Date(dateTo)
    }

    // Filter by price range
    if (isFree === 'true') {
      where.isFree = true
    } else {
      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) {
          where.price.gte = parseInt(minPrice)
        }
        if (maxPrice) {
          where.price.lte = parseInt(maxPrice)
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get events with relations
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              profileImage: true
            }
          },
          category: {
            select: {
              id: true,
              name: true
            }
          },
          reviews: {
            select: {
              rating: true
            }
          },
          _count: {
            select: {
              transactions: true
            }
          }
        },
        orderBy: [
          { startDate: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ])

    // Calculate average rating for each event
    const eventsWithRating = events.map(event => ({
      ...event,
      averageRating: event.reviews.length > 0 
        ? event.reviews.reduce((acc, review) => acc + review.rating, 0) / event.reviews.length
        : 0,
      totalParticipants: event._count.transactions
    }))

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return NextResponse.json({
      events: eventsWithRating,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data event' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Forbidden - Only organizers can create events' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      categoryId,
      startDate,
      endDate,
      location,
      price,
      totalSeats,
      thumbnail,
      isFree
    } = body

    // Validation
    if (!title || !description || !categoryId || !startDate || !endDate || !location || !totalSeats) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if dates are valid
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      )
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        title,
        description,
        categoryId,
        startDate: start,
        endDate: end,
        location,
        price: isFree ? 0 : price,
        totalSeats,
        availableSeats: totalSeats, // Initially all seats are available
        thumbnail: thumbnail || null,
        isFree: isFree || price === 0,
        organizerId: session.user.id,
      },
      include: {
        category: true,
        organizer: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    // Create default ticket type
    await prisma.ticketType.create({
      data: {
        name: isFree ? 'Free Ticket' : 'Regular',
        price: isFree ? 0 : price,
        description: 'Default ticket type',
        available: totalSeats,
        eventId: event.id,
      }
    })

    return NextResponse.json(event)

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
