import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  console.log('🔧 Creating simple test user...')
  
  // Hapus user test jika ada
  await prisma.user.deleteMany({
    where: { email: 'test@admin.com' }
  })
  
  // Buat user test baru
  const hashedPassword = await bcrypt.hash('123456', 10)
  const testUser = await prisma.user.create({
    data: {
      email: 'test@admin.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      points: 0
    }
  })
  
  console.log('✅ Test user created:')
  console.log('   Email: test@admin.com')
  console.log('   Password: 123456')
  console.log('   Role:', testUser.role)
  
  // Test password
  const isMatch = await bcrypt.compare('123456', testUser.password)
  console.log('   Password verification:', isMatch ? '✅ VALID' : '❌ INVALID')
}

createTestUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
