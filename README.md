# Ticket Management System

A modern ticket management system built with Next.js, Prisma, and NextAuth.

## Features

- 🎫 Create and manage tickets
- 👥 User authentication and registration
- 📊 Dashboard with analytics
- 🔍 Advanced ticket filtering and search
- 📧 Email notifications
- 🏷️ Priority and status management

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Initialize database:**
   ```bash
   npm run db:sync
   npm run db:seed
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Database Management

### Quick Commands

```bash
# Check if database is locked
npm run db:check

# Fix database lock issues (recommended)
npm run db:fix

# Reset database completely
npm run db:reset

# Sync database schema
npm run db:sync

# Seed database with initial data
npm run db:seed
```

### Troubleshooting Database Issues

If you encounter database errors like "Unable to open the database file":

1. **Quick fix:**
   ```bash
   npm run db:fix
   ```

2. **Manual steps:**
   ```bash
   # Check what's locking the database
   npm run db:check
   
   # Kill blocking processes and restart
   pkill -f "prisma studio"
   pkill -f "next dev"
   npm run db:sync
   npm run dev
   ```

3. **For persistent issues:**
   ```bash
   npm run db:reset
   npm run db:seed
   ```

See `DATABASE_TROUBLESHOOTING.md` for detailed troubleshooting guide.

## Project Structure

```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                # Utilities and configurations
│   └── types/              # TypeScript type definitions
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts            # Database seeding
│   └── migrations/        # Database migrations
├── public/                # Static assets
└── scripts/               # Helper scripts
```

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Email (optional)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Database Scripts

- `npm run db:check` - Check database lock status
- `npm run db:fix` - Fix common database issues
- `npm run db:reset` - Reset database (deletes all data)
- `npm run db:sync` - Sync database schema
- `npm run db:seed` - Seed database with initial data

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set up production database:**
   - For production, consider using PostgreSQL instead of SQLite
   - Update `DATABASE_URL` in production environment

3. **Deploy to your platform:**
   - Vercel (recommended)
   - Netlify
   - Self-hosted

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

A comprehensive event ticket management system built with **Next.js 15**, **TypeScript**, **Prisma**, and **NextAuth.js**. Features role-based access control, payment processing, and admin dashboard.

![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.20.0-2D3748)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC)

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based access control** (Customer, Organizer, Admin)
- **NextAuth.js integration** with credentials provider
- **Automatic role-based redirects**
- **Secure password hashing** with bcryptjs

### 🎪 Event Management
- **Create and manage events** (Organizers)
- **Event browsing with filters** (Categories, price, date)
- **Advanced search functionality**
- **Responsive event cards with modern UI**

### 🎟️ Ticket Booking System
- **Multiple ticket types per event**
- **Real-time availability checking**
- **Shopping cart functionality**
- **Discount system** (vouchers, referral codes, points)

### 💳 Transaction Management
- **Payment proof upload**
- **Admin approval workflow**
- **Transaction status tracking**
- **Email notifications** (ready for implementation)

### 👨‍💼 Admin Dashboard
- **Transaction approval/rejection**
- **User management**
- **Payment proof verification**
- **Comprehensive analytics**

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Dark/Light mode support**
- **Smooth animations** with Lucide React icons
- **Mobile-first approach**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hylmii/tiket-management.git
   cd tiket-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 15 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Organizer dashboard
│   ├── events/            # Event pages
│   └── profile/           # User profile pages
├── components/            # Reusable components
│   ├── admin/             # Admin-specific components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── events/            # Event-related components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── lib/                   # Utility libraries
├── hooks/                 # Custom React hooks
└── __tests__/             # Test files
```

## 🔑 Default Users

After seeding the database, you can use these accounts:

### Admin Account
- **Email**: `admin@admin.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Organizer Account  
- **Email**: `organizer@test.com`
- **Password**: `password123`
- **Role**: ORGANIZER

### Customer Account
- **Email**: `customer@test.com`
- **Password**: `password123`
- **Role**: CUSTOMER

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Jest & React Testing Library
- **Validation**: Zod (ready for implementation)

## 📊 Database Schema

### Core Entities
- **Users** (Customer, Organizer, Admin roles)
- **Events** (Created by organizers)
- **Categories** (Event categorization)
- **TicketTypes** (Multiple types per event)
- **Transactions** (Booking records)
- **TransactionTickets** (Ticket details per transaction)

### Features
- **Referral System** (Discount codes)
- **Points System** (Reward points)
- **Vouchers** (Promotional discounts)

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Events
- `GET /api/events` - List all events
- `GET /api/events/[id]` - Get event details

### Transactions
- `POST /api/transactions` - Create transaction
- `POST /api/transactions/payment-proof` - Upload payment proof
- `GET /api/transactions` - List user transactions

### Admin
- `GET /api/admin/transactions` - List all transactions
- `POST /api/admin/transactions/[id]/confirm` - Confirm payment
- `POST /api/admin/transactions/[id]/reject` - Reject payment
- `GET /api/admin/users/[id]` - Get user details

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

### Other Platforms
- **Netlify**: Configure build settings
- **Railway**: Add Postgres database
- **Heroku**: Add Postgres add-on

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Hylmi Rafif Rabbani**
- GitHub: [@Hylmii](https://github.com/Hylmii)
- Email: hylmirafif@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- Tailwind CSS for the utility-first CSS framework
- Prisma for the excellent ORM

---

⭐ **If you found this project helpful, please give it a star!**
