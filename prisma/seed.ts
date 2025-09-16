import { PrismaClient, UserRole, TransactionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Teknologi',
        description: 'Event seputar teknologi, coding, dan IT'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Bisnis',
        description: 'Event bisnis, entrepreneurship, dan startup'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Pendidikan',
        description: 'Seminar, workshop, dan pelatihan'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Hiburan',
        description: 'Konser, festival, dan acara hiburan'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Olahraga',
        description: 'Kompetisi dan event olahraga'
      }
    })
  ])

  console.log('✅ Categories created')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Admin yang juga bisa jadi organizer
  const adminOrganizer = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin & Event Organizer',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      points: 0
    }
  })

  const organizer2 = await prisma.user.create({
    data: {
      email: 'startup.organizer@example.com',
      name: 'Startup Community Jakarta',
      password: hashedPassword,
      role: UserRole.ORGANIZER,
      isEmailVerified: true,
      points: 0
    }
  })

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      name: 'John Doe',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      points: 25000
    }
  })

  const customer2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      isEmailVerified: true,
      points: 15000,
      referredBy: customer1.referralNumber
    }
  })

  console.log('✅ Users created')

  // Create system coupons
  const welcomeCoupon = await prisma.coupon.create({
    data: {
      code: 'WELCOME2024',
      discount: 50000,
      discountType: 'FIXED',
      minPurchase: 100000,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      description: 'Welcome coupon for new users'
    }
  })

  // Assign welcome coupon to customers
  await prisma.userCoupon.createMany({
    data: [
      { userId: customer1.id, couponId: welcomeCoupon.id },
      { userId: customer2.id, couponId: welcomeCoupon.id }
    ]
  })

  console.log('✅ Coupons created and assigned')

  // Create events
  const now = new Date()
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const event1 = await prisma.event.create({
    data: {
      title: 'Next.js Full-Stack Development Workshop',
      description: 'Learn to build modern web applications with Next.js, TypeScript, and Prisma. Hands-on workshop with real projects.',
      startDate: nextWeek,
      endDate: new Date(nextWeek.getTime() + 8 * 60 * 60 * 1000), // 8 hours later
      location: 'Jakarta Convention Center',
      price: 299000,
      totalSeats: 100,
      availableSeats: 85,
      thumbnail: '/api/placeholder/event1.jpg',
      organizerId: adminOrganizer.id,
      categoryId: categories[0].id, // Teknologi
      isFree: false
    }
  })

  const event2 = await prisma.event.create({
    data: {
      title: 'Startup Pitch Competition 2024',
      description: 'Annual startup pitch competition with prizes worth 500 million rupiah. Meet investors and fellow entrepreneurs.',
      startDate: nextMonth,
      endDate: new Date(nextMonth.getTime() + 6 * 60 * 60 * 1000),
      location: 'Surabaya Startup Hub',
      price: 150000,
      totalSeats: 200,
      availableSeats: 200,
      thumbnail: '/api/placeholder/event2.jpg',
      organizerId: organizer2.id,
      categoryId: categories[1].id, // Bisnis
      isFree: false
    }
  })

  const event3 = await prisma.event.create({
    data: {
      title: 'Free React Native Basics',
      description: 'Free introduction to React Native mobile app development. Perfect for beginners.',
      startDate: tomorrow,
      endDate: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      location: 'Online - Zoom',
      price: 0,
      totalSeats: 500,
      availableSeats: 445,
      thumbnail: '/api/placeholder/event3.jpg',
      organizerId: adminOrganizer.id,
      categoryId: categories[0].id, // Teknologi
      isFree: true
    }
  })

  console.log('✅ Events created')

  // Create ticket types
  await Promise.all([
    // Event 1 ticket types
    prisma.ticketType.create({
      data: {
        name: 'Regular',
        price: 299000,
        description: 'Standard workshop access with materials',
        available: 60,
        eventId: event1.id
      }
    }),
    prisma.ticketType.create({
      data: {
        name: 'VIP',
        price: 499000,
        description: 'VIP access with lunch, certification, and 1-on-1 mentoring',
        available: 25,
        eventId: event1.id
      }
    }),
    
    // Event 2 ticket types
    prisma.ticketType.create({
      data: {
        name: 'Participant',
        price: 150000,
        description: 'Pitch competition participant ticket',
        available: 50,
        eventId: event2.id
      }
    }),
    prisma.ticketType.create({
      data: {
        name: 'Audience',
        price: 75000,
        description: 'Audience ticket to watch the competition',
        available: 150,
        eventId: event2.id
      }
    }),
    
    // Event 3 ticket types
    prisma.ticketType.create({
      data: {
        name: 'Free Access',
        price: 0,
        description: 'Free online workshop access',
        available: 500,
        eventId: event3.id
      }
    })
  ])

  console.log('✅ Ticket types created')

  // Create vouchers
  await Promise.all([
    prisma.voucher.create({
      data: {
        code: 'EARLY50',
        discount: 50000,
        discountType: 'FIXED',
        maxUses: 20,
        currentUses: 5,
        minPurchase: 200000,
        validFrom: now,
        validUntil: nextWeek,
        eventId: event1.id
      }
    }),
    prisma.voucher.create({
      data: {
        code: 'STARTUP25',
        discount: 25,
        discountType: 'PERCENTAGE',
        maxUses: 50,
        currentUses: 8,
        minPurchase: 100000,
        validFrom: now,
        validUntil: nextMonth,
        eventId: event2.id
      }
    })
  ])

  console.log('✅ Vouchers created')

  // Create sample transactions
  const ticketTypes = await prisma.ticketType.findMany()
  
  const transaction1 = await prisma.transaction.create({
    data: {
      totalAmount: 299000,
      discountAmount: 25000,
      finalAmount: 274000,
      status: TransactionStatus.CONFIRMED,
      userId: customer1.id,
      eventId: event1.id,
      paymentDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      confirmedAt: new Date(),
      confirmedBy: adminOrganizer.id
    }
  })

  await prisma.transactionTicket.create({
    data: {
      quantity: 1,
      unitPrice: 299000,
      transactionId: transaction1.id,
      ticketTypeId: ticketTypes[0].id
    }
  })

  // Create another transaction waiting for confirmation
  const transaction2 = await prisma.transaction.create({
    data: {
      totalAmount: 150000,
      discountAmount: 0,
      finalAmount: 150000,
      status: TransactionStatus.WAITING_CONFIRMATION,
      userId: customer2.id,
      eventId: event2.id,
      paymentDeadline: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      paymentProof: '/uploads/payment-proof-sample.jpg'
    }
  })

  await prisma.transactionTicket.create({
    data: {
      quantity: 2,
      unitPrice: 75000,
      transactionId: transaction2.id,
      ticketTypeId: ticketTypes[1].id
    }
  })

  console.log('✅ Sample transactions created')

  // Create point transactions
  await Promise.all([
    prisma.pointTransaction.create({
      data: {
        points: 25000,
        type: 'EARNED_REFERRAL',
        description: 'Points earned from referral',
        userId: customer1.id,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    }),
    prisma.pointTransaction.create({
      data: {
        points: -25000,
        type: 'USED_PURCHASE',
        description: 'Points used for Next.js workshop',
        userId: customer1.id,
        transactionId: transaction1.id
      }
    })
  ])

  console.log('✅ Point transactions created')

  // Create sample reviews
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Amazing workshop! Learned so much about Next.js and the instructor was very knowledgeable.',
      userId: customer1.id,
      eventId: event1.id
    }
  })

  console.log('✅ Sample reviews created')

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
