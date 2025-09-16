import bcrypt from 'bcryptjs'

async function testPassword() {
  const password = 'password123'
  const testHashes = [
    '$2a$10$1234567890123456789012u.nX8b6v2oRaDnqNxr4XtIx.nKYq7HKu', // sample hash
  ]
  
  // Create fresh hash
  const freshHash = await bcrypt.hash(password, 10)
  console.log('Fresh hash:', freshHash)
  
  // Test fresh hash
  const isValid = await bcrypt.compare(password, freshHash)
  console.log('Fresh hash test:', isValid ? '✅ VALID' : '❌ INVALID')
  
  // Test with different salts
  const hash10 = await bcrypt.hash(password, 10)
  const hash12 = await bcrypt.hash(password, 12)
  
  console.log('Hash with salt 10:', await bcrypt.compare(password, hash10) ? '✅' : '❌')
  console.log('Hash with salt 12:', await bcrypt.compare(password, hash12) ? '✅' : '❌')
}

testPassword().catch(console.error)
