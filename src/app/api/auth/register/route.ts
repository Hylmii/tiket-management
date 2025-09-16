import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
// import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, referralCode } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      )
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Verify referral code if provided
    let referrer = null
    if (referralCode) {
      referrer = await prisma.user.findUnique({
        where: { referralNumber: referralCode }
      })

      if (!referrer) {
        return NextResponse.json(
          { error: 'Kode referral tidak valid' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        referredBy: referrer?.referralNumber,
        isEmailVerified: true // For MVP, skip email verification
      }
    })

    // Process referral rewards if applicable
    if (referrer) {
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

      // Update referrer's points
      await prisma.user.update({
        where: { id: referrer.id },
        data: {
          points: {
            increment: 10000
          }
        }
      })

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

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: userWithoutPassword
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
