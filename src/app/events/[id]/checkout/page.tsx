import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CheckoutForm } from '@/components/checkout/checkout-form'

interface CheckoutPageProps {
  params: {
    id: string
  }
  searchParams: {
    ticketType?: string
    quantity?: string
  }
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  const { ticketType, quantity } = searchParams
  
  if (!ticketType || !quantity) {
    redirect(`/events/${params.id}`)
  }

  // Get event and ticket type details
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
      category: true,
      ticketTypes: {
        where: {
          id: ticketType,
        },
      },
    },
  })

  if (!event || event.ticketTypes.length === 0) {
    notFound()
  }

  const selectedTicketType = event.ticketTypes[0]
  const quantityNum = parseInt(quantity)

  if (quantityNum <= 0 || quantityNum > 5) {
    redirect(`/events/${params.id}`)
  }

  // Check if event is still available
  const isEventPassed = new Date(event.endDate) < new Date()
  if (isEventPassed) {
    redirect(`/events/${params.id}`)
  }

  // Calculate available seats - use the available field directly
  const availableSeats = selectedTicketType.available

  if (availableSeats < quantityNum) {
    redirect(`/events/${params.id}`)
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      points: true,
    },
  })

  if (!user) {
    redirect('/auth/signin')
  }

  // Get available vouchers and coupons
  const userCoupons = await prisma.userCoupon.findMany({
    where: {
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

  const vouchers = await prisma.voucher.findMany({
    where: {
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
      eventId: event.id,
    },
  })

  const checkoutData = {
    event: {
      id: event.id,
      title: event.title,
      startDate: event.startDate,
      location: event.location,
      organizer: event.organizer,
      category: event.category,
    },
    ticketType: selectedTicketType,
    quantity: quantityNum,
    user,
    availableCoupons: userCoupons.map(uc => ({
      id: uc.id,
      isUsed: uc.isUsed,
      coupon: {
        id: uc.coupon.id,
        code: uc.coupon.code,
        discountType: uc.coupon.discountType as 'FIXED' | 'PERCENTAGE',
        discountValue: uc.coupon.discount,
        maxDiscount: null, // Adjust if your schema has this field
        minPurchase: uc.coupon.minPurchase,
        description: uc.coupon.description,
      }
    })),
    availableVouchers: vouchers.map(v => ({
      id: v.id,
      code: v.code,
      discountType: v.discountType as 'FIXED' | 'PERCENTAGE',
      discountValue: v.discount,
      maxDiscount: null, // Adjust if your schema has this field
      minPurchase: v.minPurchase,
      description: null, // Voucher model doesn't have description
    })),
  }

  return <CheckoutForm data={checkoutData} />
}
