import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const transactionId = formData.get('transactionId') as string

    if (!file || !transactionId) {
      return NextResponse.json(
        { error: 'Missing file or transaction ID' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Get transaction and verify ownership
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Check if transaction is in correct status
    if (transaction.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { error: 'Cannot upload payment proof for this transaction status' },
        { status: 400 }
      )
    }

    // Check if payment deadline has passed
    if (transaction.paymentDeadline && new Date(transaction.paymentDeadline) < new Date()) {
      return NextResponse.json(
        { error: 'Payment deadline has passed' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public/uploads/payment-proofs')
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${transactionId}-${timestamp}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    try {
      await writeFile(filePath, buffer)
    } catch (error) {
      // If upload directory doesn't exist, create it
      const fs = require('fs')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
        await writeFile(filePath, buffer)
      } else {
        throw error
      }
    }

    // Update transaction with payment proof path and status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: `/uploads/payment-proofs/${fileName}`,
        status: 'WAITING_CONFIRMATION',
      },
    })

    return NextResponse.json({
      message: 'Payment proof uploaded successfully',
      transaction: updatedTransaction,
    })
  } catch (error) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
