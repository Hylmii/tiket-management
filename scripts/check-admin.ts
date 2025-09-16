import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function checkAndFixAdmin() {
  console.log('🔍 Checking admin user...')
  
  // Cari user admin
  const admin = await prisma.user.findFirst({
    where: { 
      email: 'admin@example.com' 
    }
  })
  
  if (!admin) {
    console.log('❌ Admin user not found')
    
    // Buat admin baru
    const hashedPassword = await bcrypt.hash('password123', 10)
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin & Event Organizer',
        password: hashedPassword,
        role: 'ADMIN',
        isEmailVerified: true,
        points: 0
      }
    })
    
    console.log('✅ New admin created:', newAdmin.email)
  } else {
    console.log('✅ Admin found:', admin.email, 'Role:', admin.role)
    
    // Reset password admin
    const hashedPassword = await bcrypt.hash('password123', 10)
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    })
    
    console.log('✅ Admin password reset to: password123')
  }
  
  // Tampilkan semua users
  const allUsers = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      isEmailVerified: true
    }
  })
  
  console.log('\n📋 All users in database:')
  allUsers.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - ${user.name}`)
  })
  
  // Test password
  const testPassword = 'password123'
  const isMatch = await bcrypt.compare(testPassword, admin?.password || '')
  console.log(`\n🔐 Password test for admin: ${isMatch ? '✅ VALID' : '❌ INVALID'}`)
}

checkAndFixAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
