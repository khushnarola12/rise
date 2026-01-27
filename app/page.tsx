import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserData, getRoleBasedRedirect } from '@/lib/auth';
import Link from 'next/link';
import { Dumbbell, Users, Calendar, TrendingUp, ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const { userId } = await auth();

  // If user is logged in, redirect to their dashboard
  if (userId) {
    const userData = await getCurrentUserData();
    if (userData) {
      redirect(getRoleBasedRedirect(userData.role));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">Rise Fitness</span>
            </div>
            <Link 
              href="/sign-in"
              className="px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-medium"
            >
              Sign In
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Transform Your
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Gym Management
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Professional gym management system with advanced diet planning, workout tracking, and real-time analytics.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <Link 
                href="/sign-in"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 font-semibold text-lg flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="#features"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold text-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl"
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-300 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-12 border-t border-white/10">
          <div className="text-center text-gray-400">
            <p>&copy; 2026 Rise Fitness. All rights reserved.</p>
            <p className="mt-2 text-sm">Professional Gym Management System</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Efficiently manage members, trainers, and staff with role-based access control."
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with detailed analytics and reports."
  },
  {
    icon: Dumbbell,
    title: "Workout Plans",
    description: "Create and assign personalized workout plans with exercise tracking."
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Track member progress with detailed charts and performance metrics."
  }
];

const stats = [
  { value: "100%", label: "Secure" },
  { value: "24/7", label: "Support" },
  { value: "∞", label: "Scalable" }
];
