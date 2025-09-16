import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Admin users dapat mengakses admin dashboard atau organizer dashboard
  if (session.user.role === UserRole.ADMIN) {
    redirect('/admin')
  }
  
  // Organizer users ke organizer dashboard
  if (session.user.role === UserRole.ORGANIZER) {
    redirect('/dashboard/events')
  }
  
  // Customer users ke profile
  redirect('/profile')
}
