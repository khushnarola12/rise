'use client';

import Link from 'next/link';
import { Dumbbell, Users, Calendar, TrendingUp, ArrowRight, Shield, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Navigation */}
      <nav className="relative z-50 container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <Dumbbell className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Rise Fitness</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            href="/sign-in"
            className="px-6 py-2.5 text-sm font-semibold border border-border rounded-full hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-300 backdrop-blur-sm"
          >
            Sign In
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            V2.0 is now live
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight">
            Elevate Your <br />
            <span className="gradient-text">
              Gym Experience
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed">
            The ultimate gym management platform designed for modern fitness centers. 
            Streamline operations, engage members, and drive growth.
          </motion.p>

          <motion.div variants={itemVariants} className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/sign-in"
              className="group relative px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-full overflow-hidden transition-transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="/#features"
              className="px-8 py-4 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View Features
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Dashboard Preview (Abstract) */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 container mx-auto px-6 mb-32"
      >
        <div className="relative rounded-2xl border border-border bg-card/50 backdrop-blur-xl aspect-[16/9] shadow-2xl overflow-hidden p-2 md:p-4">
          <div className="w-full h-full bg-background/50 rounded-xl border border-border/50 flex overflow-hidden">
            {/* Fake Sidebar */}
            <div className="w-64 border-r border-border p-4 flex flex-col gap-4 hidden md:flex bg-muted/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                   <Dumbbell className="w-5 h-5" />
                </div>
                <div className="h-2 w-24 bg-muted-foreground/20 rounded-full" />
              </div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <div className="w-5 h-5 rounded bg-muted-foreground/10" />
                  <div className="h-2 w-32 bg-muted-foreground/10 rounded-full" />
                </div>
              ))}
            </div>

            {/* Fake Main Content */}
            <div className="flex-1 flex flex-col p-6 gap-6">
              {/* Fake Header */}
              <div className="flex justify-between items-center">
                <div className="h-6 w-48 bg-muted-foreground/20 rounded-full" />
                <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                    <div className="w-8 h-8 rounded-full bg-muted-foreground/10" />
                </div>
              </div>

              {/* Fake Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card flex flex-col gap-3">
                        <div className="flex justify-between">
                            <div className="w-8 h-8 rounded-lg bg-muted" />
                            <div className="w-12 h-4 rounded-full bg-green-500/20" />
                        </div>
                        <div className="h-6 w-24 bg-muted-foreground/20 rounded-full mt-2" />
                        <div className="h-3 w-32 bg-muted-foreground/10 rounded-full" />
                    </div>
                ))}
              </div>

              {/* Fake Chart Area */}
              <div className="flex-1 rounded-xl border border-border bg-card p-6 flex items-end gap-2 relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-50" />
                 {/* Bar Chart Bars */}
                 {[40, 65, 45, 80, 55, 70, 40, 60, 75, 50, 65, 85, 95].map((height, i) => (
                    <div 
                        key={i} 
                        className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary transition-colors duration-300"
                        style={{ height: `${height}%` }}
                    />
                 ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <section id="features" className="relative z-10 container mx-auto px-6 py-32 border-t border-border">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="group p-8 rounded-3xl bg-card border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-500"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section with Divider */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border border-y border-border bg-card/30 backdrop-blur-sm rounded-3xl">
          {stats.map((stat, index) => (
            <div key={index} className="flex-1 p-12 text-center group cursor-default">
              <h3 className="text-5xl md:text-6xl font-bold gradient-text mb-2 group-hover:scale-110 transition-transform duration-500">
                {stat.value}
              </h3>
              <p className="text-muted-foreground uppercase tracking-widest text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">Ready to transform your gym?</h2>
          <p className="text-xl text-muted-foreground">Join elite fitness centers using Rise Fitness to scale their operations.</p>
          <Link 
            href="/sign-in"
            className="inline-block px-12 py-5 bg-primary text-primary-foreground text-lg font-bold rounded-full hover:opacity-90 transition-opacity"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">&copy; 2026 Rise Fitness. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Streamline your member database with powerful tools for tracking and engagement."
  },
  {
    icon: Activity,
    title: "Performance Tracking",
    description: "Advanced analytics to monitor gym performance and member progress in real-time."
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Effortless class scheduling and trainer management with automated conflicts resolution."
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Enterprise-grade security for your data and integrated access control systems."
  }
];

const stats = [
  { value: "100%", label: "Uptime" },
  { value: "24/7", label: "Support" },
  { value: "∞", label: "Scale" }
];
