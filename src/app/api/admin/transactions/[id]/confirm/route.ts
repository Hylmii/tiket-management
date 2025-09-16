import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, PointTransactionType } from '@prisma/client'
// import { sendEmail, emailTemplates } from '@/lib/email'
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

    const resolvedParams = await params

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
    const result = await transactions.confirmPayment(resolvedParams.id, session.user.id)

    // Get updated transaction details for email
    const updatedTransaction = await prisma.transaction.findUnique({
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

    // Send confirmation email to user
    try {
      // const emailContent = emailTemplates.transactionConfirmed(
      //   updatedTransaction!.user.name,
      //   updatedTransaction!.event.title,
      //   updatedTransaction!.id
      // )
      
      // await sendEmail({
      //   to: updatedTransaction!.user.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // })
      console.log('Email would be sent to:', updatedTransaction!.user.email)
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the transaction if email fails
    }

    return NextResponse.json({ 
      success: true, 
      transaction: result.updatedTransaction,
      pointsAwarded: result.pointsAwarded
    })
  } catch (error) {
    console.error('Error confirming transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
