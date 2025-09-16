import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { CreateEventForm } from '@/components/events/create-event-form'

export default async function CreateEventPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== UserRole.ORGANIZER && session.user.role !== UserRole.ADMIN) {
    redirect('/')
  }

  // Fetch categories for the form
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  return <CreateEventForm categories={categories} />
}
