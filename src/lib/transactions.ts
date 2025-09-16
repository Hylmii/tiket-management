import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

type TransactionClient = Omit<typeof prisma, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>

export async function withTransaction<T>(
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback)
}

// Specific transaction helpers for common operations
export const transactions = {
  // Confirm payment transaction with all related updates
  confirmPayment: async (transactionId: string, adminId: string) => {
    return await withTransaction(async (tx) => {
      // Get transaction details
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true, event: true }
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.status !== 'WAITING_CONFIRMATION') {
        throw new Error('Transaction is not waiting for confirmation')
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          confirmedBy: adminId
        }
      })

      // Calculate and add points (5% of final amount)
      const pointsToAdd = Math.floor(transaction.finalAmount * 0.05)
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 3) // 3 months from now

      await tx.pointTransaction.create({
        data: {
          userId: transaction.userId,
          points: pointsToAdd,
          type: 'EARNED_PURCHASE',
          description: `Points earned from transaction ${transaction.id}`,
          transactionId: transaction.id,
          expiresAt
        }
      })

      // Update user's total points
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          points: { increment: pointsToAdd }
        }
      })

      return { updatedTransaction, pointsAwarded: pointsToAdd }
    })
  },

  // Reject payment transaction with rollback
  rejectPayment: async (transactionId: string, reason: string) => {
    return await withTransaction(async (tx) => {
      // Get transaction details with point transactions
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          user: true,
          event: true,
          pointTransactions: true
        }
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.status !== 'WAITING_CONFIRMATION') {
        throw new Error('Transaction is not waiting for confirmation')
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason
        }
      })

      // Restore points if they were used
      const pointsUsed = transaction.pointTransactions.find(pt => pt.points < 0)
      if (pointsUsed) {
        // Add back the points that were used
        await tx.pointTransaction.create({
          data: {
            userId: transaction.userId,
            points: Math.abs(pointsUsed.points),
            type: 'EARNED_PURCHASE', // Restore as earned purchase
            description: `Points restored from rejected transaction ${transaction.id}`,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
          }
        })

        await tx.user.update({
          where: { id: transaction.userId },
          data: {
            points: { increment: Math.abs(pointsUsed.points) }
          }
        })
      }

      // Restore event seats
      await tx.event.update({
        where: { id: transaction.eventId },
        data: {
          availableSeats: { increment: 1 } // Assuming 1 seat per transaction
        }
      })

      return updatedTransaction
    })
  },

  // Create new user with referral processing
  createUserWithReferral: async (userData: {
    name: string
    email: string
    password: string
    role: string
    referralCode?: string
  }) => {
    return await withTransaction(async (tx) => {
      // Check if referral code exists
      let referrer = null
      if (userData.referralCode) {
        referrer = await tx.user.findUnique({
          where: { referralNumber: userData.referralCode }
        })

        if (!referrer) {
          throw new Error('Invalid referral code')
        }
      }

      // Create user
      const user = await tx.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role as any,
          referredBy: referrer?.referralNumber,
          isEmailVerified: true
        }
      })

      // Process referral rewards if applicable
      if (referrer) {
        // Give points to referrer
        const expiresAt = new Date()
        expiresAt.setMonth(expiresAt.getMonth() + 3) // 3 months from now

        await tx.pointTransaction.create({
          data: {
            userId: referrer.id,
            points: 10000,
            type: 'EARNED_REFERRAL',
            description: `Referral bonus from ${user.name}`,
            expiresAt
          }
        })

        // Update referrer's points
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: 10000 }
          }
        })

        // Create welcome coupon for new user if available
        const welcomeCoupon = await tx.coupon.findFirst({
          where: {
            code: 'WELCOME2024',
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() }
          }
        })

        if (welcomeCoupon) {
          await tx.userCoupon.create({
            data: {
              userId: user.id,
              couponId: welcomeCoupon.id
            }
          })
        }
      }

      return { user, referrer }
    })
  },

  // Process checkout with points and coupons
  processCheckout: async (checkoutData: {
    userId: string
    eventId: string
    ticketTypeId: string
    quantity: number
    pointsToUse?: number
    couponId?: string
  }) => {
    return await withTransaction(async (tx) => {
      // Get event and ticket type
      const event = await tx.event.findUnique({
        where: { id: checkoutData.eventId },
        include: { ticketTypes: true }
      })

      if (!event) {
        throw new Error('Event not found')
      }

      const ticketType = event.ticketTypes.find(tt => tt.id === checkoutData.ticketTypeId)
      if (!ticketType) {
        throw new Error('Ticket type not found')
      }

      // Check availability
      if (event.availableSeats < checkoutData.quantity) {
        throw new Error('Not enough seats available')
      }

      // Calculate amounts
      const totalAmount = ticketType.price * checkoutData.quantity
      let discountAmount = 0
      let finalAmount = totalAmount

      // Apply points discount
      if (checkoutData.pointsToUse && checkoutData.pointsToUse > 0) {
        const user = await tx.user.findUnique({ where: { id: checkoutData.userId } })
        if (!user || user.points < checkoutData.pointsToUse) {
          throw new Error('Insufficient points')
        }

        discountAmount += checkoutData.pointsToUse
        finalAmount -= checkoutData.pointsToUse

        // Deduct points from user
        await tx.user.update({
          where: { id: checkoutData.userId },
          data: { points: { decrement: checkoutData.pointsToUse } }
        })
      }

      // Apply coupon discount
      if (checkoutData.couponId) {
        const userCoupon = await tx.userCoupon.findFirst({
          where: {
            userId: checkoutData.userId,
            couponId: checkoutData.couponId,
            isUsed: false
          },
          include: { coupon: true }
        })

        if (!userCoupon) {
          throw new Error('Coupon not found or already used')
        }

        const couponDiscount = userCoupon.coupon.discountType === 'PERCENTAGE'
          ? (finalAmount * userCoupon.coupon.discount) / 100
          : userCoupon.coupon.discount

        discountAmount += couponDiscount
        finalAmount -= couponDiscount

        // Mark coupon as used
        await tx.userCoupon.update({
          where: { id: userCoupon.id },
          data: { isUsed: true, usedAt: new Date() }
        })
      }

      finalAmount = Math.max(0, finalAmount) // Ensure final amount is not negative

      // Create transaction
      const paymentDeadline = new Date()
      paymentDeadline.setHours(paymentDeadline.getHours() + 2) // 2 hours from now

      const transaction = await tx.transaction.create({
        data: {
          userId: checkoutData.userId,
          eventId: checkoutData.eventId,
          totalAmount,
          discountAmount,
          finalAmount,
          status: 'WAITING_PAYMENT',
          paymentDeadline
        }
      })

      // Create transaction tickets
      await tx.transactionTicket.create({
        data: {
          transactionId: transaction.id,
          ticketTypeId: checkoutData.ticketTypeId,
          quantity: checkoutData.quantity,
          unitPrice: ticketType.price
        }
      })

      // Record points usage
      if (checkoutData.pointsToUse && checkoutData.pointsToUse > 0) {
        await tx.pointTransaction.create({
          data: {
            userId: checkoutData.userId,
            points: -checkoutData.pointsToUse,
            type: 'USED_PURCHASE',
            description: `Points used for transaction ${transaction.id}`,
            transactionId: transaction.id
          }
        })
      }

      // Update event availability
      await tx.event.update({
        where: { id: checkoutData.eventId },
        data: {
          availableSeats: { decrement: checkoutData.quantity }
        }
      })

      return transaction
    })
  }
}
