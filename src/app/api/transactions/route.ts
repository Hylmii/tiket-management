import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { eventId, ticketTypeId, quantity, pointsUsed, couponId, voucherCode } = body

    // Validate required fields
    if (!eventId || !ticketTypeId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get event and ticket type
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { id: ticketTypeId },
        },
      },
    })

    if (!event || event.ticketTypes.length === 0) {
      return NextResponse.json(
        { error: 'Event or ticket type not found' },
        { status: 404 }
      )
    }

    const ticketType = event.ticketTypes[0]

    // Check if event is still available
    if (new Date(event.endDate) < new Date()) {
      return NextResponse.json(
        { error: 'Event has ended' },
        { status: 400 }
      )
    }

    // Check ticket availability
    if (ticketType.available < quantity) {
      return NextResponse.json(
        { error: 'Not enough tickets available' },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate base amount
    const baseAmount = ticketType.price * quantity
    let totalDiscount = 0
    let pointsDiscount = 0
    let couponDiscount = 0
    let voucherDiscount = 0

    // Validate and calculate points discount
    if (pointsUsed > 0) {
      if (pointsUsed > user.points) {
        return NextResponse.json(
          { error: 'Insufficient points' },
          { status: 400 }
        )
      }
      pointsDiscount = Math.min(pointsUsed, baseAmount)
      totalDiscount += pointsDiscount
    }

    // Validate and calculate coupon discount
    let coupon = null
    if (couponId) {
      const userCoupon = await prisma.userCoupon.findFirst({
        where: {
          id: couponId,
          userId: user.id,
          isUsed: false,
          coupon: {
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() },
          },
        },
        include: {
          coupon: true,
        },
      })

      if (!userCoupon) {
        return NextResponse.json(
          { error: 'Invalid or expired coupon' },
          { status: 400 }
        )
      }

      coupon = userCoupon.coupon

      // Check minimum purchase
      if (coupon.minPurchase && baseAmount < coupon.minPurchase) {
        return NextResponse.json(
          { error: `Minimum purchase ${coupon.minPurchase} required for this coupon` },
          { status: 400 }
        )
      }

      // Calculate coupon discount
      if (coupon.discountType === 'FIXED') {
        couponDiscount = coupon.discount
      } else {
        const percentageDiscount = (baseAmount * coupon.discount) / 100
        couponDiscount = percentageDiscount
      }
      
      totalDiscount += couponDiscount
    }

    // Validate and calculate voucher discount
    let voucher = null
    if (voucherCode) {
      voucher = await prisma.voucher.findFirst({
        where: {
          code: voucherCode,
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
          eventId: eventId,
        },
      })

      if (!voucher) {
        return NextResponse.json(
          { error: 'Invalid or expired voucher' },
          { status: 400 }
        )
      }

      // Check minimum purchase
      if (voucher.minPurchase && baseAmount < voucher.minPurchase) {
        return NextResponse.json(
          { error: `Minimum purchase ${voucher.minPurchase} required for this voucher` },
          { status: 400 }
        )
      }

      // Calculate voucher discount
      if (voucher.discountType === 'FIXED') {
        voucherDiscount = voucher.discount
      } else {
        const percentageDiscount = (baseAmount * voucher.discount) / 100
        voucherDiscount = percentageDiscount
      }
      
      totalDiscount += voucherDiscount
    }

    const finalAmount = Math.max(0, baseAmount - totalDiscount)

    // Create transaction deadline (2 hours from now)
    const paymentDeadline = new Date()
    paymentDeadline.setHours(paymentDeadline.getHours() + 2)

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          userId: user.id,
          eventId: eventId,
          totalAmount: baseAmount,
          discountAmount: totalDiscount,
          finalAmount: finalAmount,
          status: 'WAITING_PAYMENT',
          paymentDeadline: paymentDeadline,
        },
      })

      // Create transaction tickets
      await tx.transactionTicket.create({
        data: {
          transactionId: transaction.id,
          ticketTypeId: ticketTypeId,
          quantity: quantity,
          unitPrice: ticketType.price,
        },
      })

      // Update ticket availability
      await tx.ticketType.update({
        where: { id: ticketTypeId },
        data: {
          available: {
            decrement: quantity,
          },
        },
      })

      // Deduct points if used
      if (pointsUsed > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: {
            points: {
              decrement: pointsUsed,
            },
          },
        })

        // Create point transaction record
        await tx.pointTransaction.create({
          data: {
            userId: user.id,
            points: -pointsUsed,
            type: 'USED_PURCHASE',
            description: `Used for ticket purchase - ${event.title}`,
            transactionId: transaction.id,
          },
        })
      }

      // Mark coupon as used
      if (couponId) {
        await tx.userCoupon.update({
          where: { id: couponId },
          data: { isUsed: true },
        })
      }

      return transaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where: any = {
      userId: session.user.id,
    }

    if (status) {
      where.status = status
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
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
