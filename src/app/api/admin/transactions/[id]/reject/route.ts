import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { sendEmail, emailTemplates } from '@/lib/email'
import { transactions } from '@/lib/transactions'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { reason } = await request.json()
    const resolvedParams = await params

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: true,
        event: {
          include: {
            organizer: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.status !== 'WAITING_CONFIRMATION') {
      return NextResponse.json(
        { error: 'Transaction is not waiting for confirmation' }, 
        { status: 400 }
      )
    }

    // Use transaction utility for atomic operation
    const updatedTransaction = await transactions.rejectPayment(resolvedParams.id, reason.trim())

    // Get transaction details for email
    const transactionWithDetails = await prisma.transaction.findUnique({
      where: { id: resolvedParams.id },
      include: {
        user: true,
        event: {
          include: {
            organizer: true
          }
        }
      }
    })

    // Send rejection email to user with reason
    try {
      const emailContent = emailTemplates.transactionRejected(
        transactionWithDetails!.user.name,
        transactionWithDetails!.event.title,
        transactionWithDetails!.id,
        reason.trim()
      )
      
      await sendEmail({
        to: transactionWithDetails!.user.email,
        subject: emailContent.subject,
        html: emailContent.html
      })
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError)
      // Don't fail the transaction if email fails
    }

    return NextResponse.json({ 
      success: true, 
      transaction: updatedTransaction
    })
  } catch (error) {
    console.error('Error rejecting transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
