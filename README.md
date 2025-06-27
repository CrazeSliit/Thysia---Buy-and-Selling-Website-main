# Thysia E-commerce Marketplace

A comprehensive full-stack e-commerce marketplace built with Next.js 14, TypeScript, Prisma, and NextAuth.js.

## 🚀 Features

### Multi-Role System
- **Buyers**: Browse and purchase products, track orders, leave reviews
- **Sellers**: Manage products, process orders, view analytics  
- **Drivers**: Accept delivery assignments, update delivery status
- **Admins**: Full platform management and oversight

### Core Functionality
- 🛒 Product browsing with advanced search and filtering
- 🛍️ Shopping cart and secure checkout with Stripe
- 📦 Order management and tracking
- ⭐ Product reviews and ratings
- 💬 Messaging between users
- 🔔 Real-time notifications
- 📱 Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Image Storage**: Cloudinary
- **Validation**: Zod

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or use Prisma Accelerate)

## ⚡ Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd thysia-ecommerce
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.local` and update the values:
   ```bash
   # Database
   DATABASE_URL="your-postgresql-connection-string"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Cloudinary (optional)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   
   # Stripe (optional)
   STRIPE_PUBLIC_KEY="your-stripe-public-key"
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   ```

3. **Set up the database:**
   ```bash
   npx prisma db push
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## 👥 Default Test Accounts

After running the seed script, you can use these accounts:

- **Admin**: admin@thysia.com / admin123
- **Buyer**: buyer@example.com / buyer123  
- **Seller**: seller@example.com / seller123
- **Driver**: driver@example.com / driver123

## 📁 Project Structure

```
src/
├── app/                 # Next.js 14 App Router pages
│   ├── api/            # API routes
│   ├── auth/           # Authentication pages
│   ├── admin/          # Admin dashboard
│   ├── seller/         # Seller dashboard  
│   ├── driver/         # Driver dashboard
│   ├── buyer/          # Buyer dashboard
│   └── products/       # Product pages
├── components/         # Reusable React components
│   ├── layout/         # Layout components
│   └── ui/             # UI components
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── middleware.ts       # Next.js middleware for auth
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🔒 Authentication & Authorization

The app uses NextAuth.js with:
- Email/password authentication
- Google OAuth (optional)
- Role-based access control (RBAC)
- Protected routes with middleware
- Session management

## 🗄️ Database Schema

The Prisma schema includes models for:
- Users with role-specific profiles
- Products and categories
- Orders and order items
- Shopping cart and wishlist
- Reviews and ratings
- Addresses and shipping
- Messages and notifications
- Admin logs and system settings

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact: support@thysia.com

---

Built with ❤️ using Next.js and TypeScript
