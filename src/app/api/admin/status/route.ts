import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Return system status
    const status = {
      timestamp: new Date().toISOString(),
      status: 'ok',
      functions: {
        fileUpload: 'ready',
        imageServing: 'ready',
        adminAuth: 'working',
        transactionManagement: 'ready'
      },
      endpoints: {
        '/api/upload': 'POST - File upload',
        '/api/files/[filename]': 'GET - File serving',
        '/api/admin/transactions': 'GET - Transaction list',
        '/api/admin/transactions/[id]/confirm': 'POST - Confirm payment',
        '/api/admin/transactions/[id]/reject': 'POST - Reject payment',
        '/api/admin/users/[id]': 'GET - User details',
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
