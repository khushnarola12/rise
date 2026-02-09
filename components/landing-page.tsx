'use client';

import Link from 'next/link';
import { Dumbbell, ArrowRight, Play, CheckCircle, Smartphone, Users, Flame, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const WORKOUT_IMAGES = [
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", 
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80", 
  "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=800&q=80", 
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
];

export default function LandingPage() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [0, 1]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-x-hidden font-sans">
      
      {/* Sticky Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md border-b border-white/5"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center gap-2">
           <Dumbbell className="w-8 h-8 text-primary fill-primary" />
           <span className="text-xl font-black tracking-tighter uppercase italic">RISE<span className="text-primary">.FIT</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/70">
          <Link href="#community" className="hover:text-white transition-colors">Workouts</Link>
          <Link href="#plans" className="hover:text-white transition-colors">Plans</Link>
          <Link href="#community" className="hover:text-white transition-colors">Community</Link>
        </div>

        <Link 
          href="/sign-in"
          className="px-6 py-2 bg-white text-black text-sm font-bold uppercase tracking-wider hover:bg-primary hover:scale-105 transition-all skew-x-[-12deg]"
        >
          <span className="block skew-x-[12deg]">Login</span>
        </Link>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
        {/* Video Background */}
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/80 z-10" />
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-90"
          >
            <source src="https://videos.pexels.com/video-files/855828/855828-hd_1920_1080_30fps.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-30 text-center px-4 max-w-4xl mx-auto flex flex-col items-center justify-center h-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6 drop-shadow-2xl">
              <span className="text-white block mb-2">Be Better</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Every Day</span>
            </h1>
            <p className="text-base md:text-lg text-zinc-300 max-w-xl mx-auto font-light tracking-wide mb-10 leading-relaxed">
              Experience the future of fitness. Elite training, state-of-the-art centers, and intelligent planning designed for your evolution.
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/sign-in"
                className="group relative inline-flex items-center gap-4 px-10 py-3 text-white text-base font-bold uppercase tracking-widest overflow-hidden rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-primary/10 z-50"
              >
                <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-3">
                  Start Your Journey <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Management Software Plans */}
      <section id="plans" className="py-24 px-6 bg-zinc-950 scroll-mt-24">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
              Power Your <span className="text-primary">Business</span>
            </h2>
            <p className="text-zinc-400">Scalable software solutions for every stage of your fitness business.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter Card */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1574680096141-1c57c502aa8f?w=800&q=80" 
                  alt="Starter Plan" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[1500ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
              </div>
              
              <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="mb-4">
                   <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 backdrop-blur-md">
                      <Smartphone className="w-6 h-6 text-blue-500" />
                   </div>
                   <h3 className="text-3xl font-black uppercase text-blue-500 mb-1">Starter</h3>
                   <p className="text-sm text-zinc-400">For independent trainers.</p>
                </div>
                
                <div className="text-4xl font-bold text-white mb-6">Free<span className="text-lg text-zinc-500 font-normal">/forever</span></div>
                
                <ul className="space-y-3 mb-8 text-zinc-300 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Up to 50 Clients</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Basic Workout Builder</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-blue-500" /> Progress Tracking</li>
                </ul>

                <button className="w-full py-4 bg-blue-600/90 text-white font-bold uppercase tracking-widest hover:bg-blue-600 backdrop-blur-sm transition-colors rounded-lg">
                  Get Started
                </button>
              </div>
            </motion.div>

            {/* Growth Card */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden border border-primary/50"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80" 
                  alt="Growth Plan" 
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[1500ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
              </div>

              <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-bold text-black uppercase rounded-bl-lg z-20">
                Most Popular
              </div>
              
              <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="mb-4">
                   <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 backdrop-blur-md">
                      <Zap className="w-6 h-6 text-primary" />
                   </div>
                   <h3 className="text-3xl font-black uppercase text-primary mb-1">Growth</h3>
                   <p className="text-sm text-zinc-400">For modern fitness studios.</p>
                </div>
                
                <div className="text-4xl font-bold text-white mb-6">$49<span className="text-lg text-zinc-500 font-normal">/mo</span></div>
                
                <ul className="space-y-3 mb-8 text-zinc-300 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Unlimited Members</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Automated Billing</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Staff Management</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-primary" /> Diet & Workout Plans</li>
                </ul>

                <button className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-lg">
                  Start Free Trial
                </button>
              </div>
            </motion.div>

            {/* Enterprise Card */}
            <motion.div 
              className="relative group rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1594381898411-846e7d193883?w=800&q=80" 
                  alt="Enterprise Plan" 
                  className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[1500ms] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
              </div>
              
              <div className="relative z-10 p-8 h-full flex flex-col">
                <div className="mb-4">
                   <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 backdrop-blur-md">
                      <Flame className="w-6 h-6 text-purple-500" />
                   </div>
                   <h3 className="text-3xl font-black uppercase text-purple-500 mb-1">Scale</h3>
                   <p className="text-sm text-zinc-400">For multi-location chains.</p>
                </div>
                
                <div className="text-4xl font-bold text-white mb-6">Custom</div>
                
                <ul className="space-y-3 mb-8 text-zinc-300 flex-1">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> White-label App</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Advanced API Access</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Dedicated Support</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Global Analytics</li>
                </ul>

                <button className="w-full py-4 bg-purple-600/90 text-white font-bold uppercase tracking-widest hover:bg-purple-600 backdrop-blur-sm transition-colors rounded-lg">
                  Contact Sales
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Marquee Divider */}
      <div className="bg-primary py-4 overflow-hidden border-y-4 border-black relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set */}
          <div className="flex gap-8 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={`a-${i}`} className="text-4xl font-black uppercase text-black tracking-tighter">
                    WORKOUT • NUTRITION • MINDFULNESS • RECOVERY • COMMUNITY •
                </span>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex gap-8 px-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={`b-${i}`} className="text-4xl font-black uppercase text-black tracking-tighter">
                    WORKOUT • NUTRITION • MINDFULNESS • RECOVERY • COMMUNITY •
                </span>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Grid Section */}
      <section id="community" className="py-24 px-6 bg-black scroll-mt-24">
         <div className="container mx-auto">
             <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
                 <div>
                     <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-6">
                         Join The <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">RISE.FIT</span>
                     </h2>
                     <p className="text-xl text-zinc-400 max-w-md">
                         More than just a gym. Be part of a community that pushes you further.
                     </p>
                 </div>
                 <div className="flex justify-end">
                      <Link href="#gallery-grid" className="group flex items-center gap-4 text-2xl font-bold uppercase tracking-widest hover:text-primary transition-colors">
                          View Gallery <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                      </Link>
                 </div>
             </div>

             <div id="gallery-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px] scroll-mt-32">
                 {WORKOUT_IMAGES.map((img, i) => (
                     <motion.div 
                        key={i}
                        className={`relative rounded-xl overflow-hidden group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                     >
                         <img src={img} alt="Workout" className="w-full h-full object-cover transition-transform duration-[1500ms] ease-out group-hover:scale-105" />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                         <div className="absolute bottom-4 left-4">
                             <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-bold uppercase">
                                 #RiseFit
                             </span>
                         </div>
                     </motion.div>
                 ))}
             </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-950 border-t border-white/5">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex items-center gap-2">
                 <Dumbbell className="w-6 h-6 text-white" />
                 <span className="text-lg font-bold uppercase tracking-widest">RISE.FIT</span>
             </div>
             <p className="text-zinc-500 text-sm">© 2026 RISE.FIT. All rights reserved.</p>
             <div className="flex gap-6">
                 <a href="#" className="text-zinc-500 hover:text-white">INSTAGRAM</a>
                 <a href="#" className="text-zinc-500 hover:text-white">TWITTER</a>
                 <a href="#" className="text-zinc-500 hover:text-white">YOUTUBE</a>
             </div>
         </div>
      </footer>
    </div>
  );
}
