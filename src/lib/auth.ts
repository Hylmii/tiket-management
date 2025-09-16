import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage || undefined,
            referralNumber: user.referralNumber,
            points: user.points
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.profileImage = user.profileImage
        token.referralNumber = user.referralNumber
        token.points = user.points
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.profileImage = token.profileImage as string
        session.user.referralNumber = token.referralNumber as string
        session.user.points = token.points as number
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  secret: process.env.NEXTAUTH_SECRET
}

declare module 'next-auth' {
  interface User {
    role: UserRole
    profileImage?: string
    referralNumber: string
    points: number
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
      profileImage?: string
      referralNumber: string
      points: number
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    profileImage?: string
    referralNumber: string
    points: number
  }
}
