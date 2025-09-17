import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
// import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('Registration attempt started')
    const { name, email, password, role, referralCode } = await request.json()
    console.log('Request data:', { name, email, role, referralCode: referralCode ? 'provided' : 'none' })

    // Validation
    if (!name || !email || !password) {
      console.log('Validation failed: missing required fields')
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short')
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    if (!Object.values(UserRole).includes(role)) {
      console.log('Validation failed: invalid role', role)
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    console.log('Basic validation passed')

    // Check if user already exists
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists with email:', email)
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    console.log('User does not exist, proceeding...')

    // Verify referral code if provided
    let referrer = null
    if (referralCode) {
      console.log('Checking referral code:', referralCode)
      referrer = await prisma.user.findUnique({
        where: { referralNumber: referralCode }
      })

      if (!referrer) {
        console.log('Invalid referral code:', referralCode)
        return NextResponse.json(
          { error: 'Kode referral tidak valid' },
          { status: 400 }
        )
      }
      console.log('Valid referrer found:', referrer.id)
    } else {
      console.log('No referral code provided')
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('Password hashed successfully')

    // Create user
    console.log('Creating user in database...')
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      referredBy: referrer?.referralNumber ?? null,
      isEmailVerified: true
    }
    console.log('User data to create:', { ...userData, password: '[HIDDEN]' })
    const user = await prisma.user.create({
      data: userData
    })
    console.log('User created successfully:', user.id)

    // Process referral rewards if applicable
    if (referrer) {
      console.log('Processing referral rewards...')
      // Give points to referrer (10,000 points)
      await prisma.pointTransaction.create({
        data: {
          userId: referrer.id,
          points: 10000,
          type: 'EARNED_REFERRAL',
          description: `Referral bonus from ${user.name}`,
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 3 months
        }
      })
      console.log('Point transaction created for referrer')

      // Update referrer's points
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          points: {
            increment: 10000
          }
        }
      })
      console.log('Referrer points updated')

      // Create welcome coupon for new user
      const welcomeCoupon = await prisma.coupon.findFirst({
        where: { 
          code: 'WELCOME2024',
          isActive: true 
        }
      })

      if (welcomeCoupon) {
        await prisma.userCoupon.create({
          data: {
            userId: user.id,
            couponId: welcomeCoupon.id
          }
        })
        console.log('Welcome coupon assigned to new user')
      } else {
        console.log('No welcome coupon found')
      }
    }

    // Send welcome email
    try {
      // const emailContent = emailTemplates.welcomeEmail(user.name, user.referralNumber)
      // await sendEmail({
      //   to: user.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // })
      console.log('Welcome email would be sent to:', user.email)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Don't fail registration if email fails
    }

    // Send referral reward email to referrer if applicable
    if (referrer) {
      try {
        // const referralEmailContent = emailTemplates.referralReward(
        //   referrer.name,
        //   user.name,
        //   10000
        // )
        // await sendEmail({
        //   to: referrer.email,
        //   subject: referralEmailContent.subject,
        //   html: referralEmailContent.html
        // })
        console.log('Referral reward email would be sent to:', referrer.email)
      } catch (emailError) {
        console.error('Failed to send referral reward email:', emailError)
      }
    }

    // Return success (exclude password from response)
    const { password: _, ...userWithoutPassword } = user
    console.log('Registration completed successfully for user:', user.id)

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    if (error instanceof Error) {
      // Check for specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Terjadi kesalahan server: ' + error.message },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
