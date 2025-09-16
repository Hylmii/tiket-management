# 🎫 EventHub - Ticket Management System

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
