# 🏋️ Rise Fitness - Gym Management System

A full-featured, production-grade gym management web application built with **Next.js 16**, **Clerk Authentication**, and **Supabase**.

## ✨ Features

### 🔐 Role-Based Access Control
- **Superuser**: Full system access, can manage admins, trainers, and members
- **Admin**: Manage trainers, members, workouts, diets, and attendance
- **Trainer**: View assigned members, create workout/diet plans, track progress
- **User (Member)**: View personal workout/diet plans, track progress, view attendance

### 🎯 Core Modules
- ✅ **User Management**: Create and manage users with strict role enforcement
- ✅ **Workout Management**: Create and assign personalized workout plans
- ✅ **Diet Management**: Create and assign customized diet plans with macros
- ✅ **Attendance Tracking**: Daily check-in/check-out with analytics
- ✅ **Progress Tracking**: Weight, BMI, body fat, muscle mass tracking
- ✅ **Analytics Dashboard**: Role-specific dashboards with real-time stats

### 🎨 Premium UI/UX
- Modern dark/light theme support
- Smooth animations and transitions
- Glassmorphism effects
- Responsive design (mobile-first)
- Premium gradient backgrounds
- Interactive stat cards

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Bundler**: Turbopack
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL + RLS)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Clerk account (free tier works)
- Supabase account (free tier works)

### 1. Clone and Install

```bash
cd rise
npm install
```

### 2. Environment Setup

The `.env.local` file is already configured with your credentials:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2luY2VyZS1kaW5vc2F1ci05Ni5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_UUeIZN7Rkxx8FKyg7bK0evDjHN0FtrAKPH0njYxym7

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://nkzmglmrmhvhvnipwsyn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Superuser Credentials
SUPERUSER_EMAIL=khushnarola08@gmail.com
SUPERUSER_PASSWORD=123456
```

### 3. Database Setup

1. Go to your Supabase project: https://nkzmglmrmhvhvnipwsyn.supabase.co
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Run the SQL script to create all tables, RLS policies, and functions

### 4. Clerk Setup

1. Go to your Clerk dashboard
2. Configure the following:
   - **Sign-in options**: Email/Password
   - **Redirect URLs**: 
     - Sign-in: `http://localhost:3000/api/auth/callback`
     - Sign-out: `http://localhost:3000`
   - **Disable public sign-up** (users must be created by admin)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 👤 Default Superuser

The superuser account is automatically created on first login:

- **Email**: khushnarola08@gmail.com
- **Password**: 123456

⚠️ **Important**: You must sign up in Clerk with this email first, then the system will automatically assign superuser role.

## 📁 Project Structure

```
rise/
├── app/
│   ├── (auth)/
│   │   └── sign-in/          # Sign-in page
│   ├── superuser/             # Superuser dashboard & features
│   ├── admin/                 # Admin dashboard & features
│   ├── trainer/               # Trainer dashboard & features
│   ├── user/                  # Member dashboard & features
│   ├── api/                   # API routes
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── components/                # Reusable UI components
│   ├── sidebar.tsx
│   ├── header.tsx
│   └── stat-card.tsx
├── lib/
│   ├── supabase.ts           # Supabase client & types
│   ├── auth.ts               # Auth utilities
│   └── utils.ts              # Helper functions
├── supabase/
│   └── schema.sql            # Database schema
├── middleware.ts             # Route protection
└── .env.local                # Environment variables
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-based routing**: Middleware protection for all routes
- **Clerk authentication**: Industry-standard auth
- **No public sign-up**: Only admins can create users
- **Strict role enforcement**: Users can only access their authorized routes

## 🎯 User Workflows

### Superuser Workflow
1. Login with superuser credentials
2. Create gym profile
3. Add admins
4. Add trainers
5. Add members
6. Assign trainers to members
7. Monitor analytics

### Admin Workflow
1. Login (created by superuser)
2. Add/manage trainers
3. Add/manage members
4. Create workout plans
5. Create diet plans
6. Assign plans to members
7. Mark attendance
8. View analytics

### Trainer Workflow
1. Login (created by admin/superuser)
2. View assigned members
3. Create workout plans
4. Create diet plans
5. Mark attendance for assigned members
6. Track member progress

### Member Workflow
1. Login (created by admin/superuser)
2. View assigned trainers
3. View workout plan
4. View diet plan
5. Check attendance history
6. Track personal progress

## 📊 Database Schema

The application uses the following main tables:

- `gyms` - Gym information
- `users` - All users (superuser, admin, trainer, member)
- `user_profiles` - Extended user health data
- `trainer_assignments` - Trainer-member relationships
- `workout_plans` - Workout plan templates
- `workout_exercises` - Exercises in workout plans
- `user_workout_plans` - Assigned workout plans
- `diet_plans` - Diet plan templates
- `diet_plan_meals` - Meals in diet plans
- `user_diet_plans` - Assigned diet plans
- `attendance` - Daily attendance records
- `progress_logs` - Weight, BMI, body composition tracking

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, contact the development team.

---

Built with ❤️ using Next.js 16 + Turbopack
