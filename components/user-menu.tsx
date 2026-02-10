'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { LogOut, User as UserIcon, LayoutDashboard, Loader2 } from 'lucide-react'
import { User } from '@/lib/supabase'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold ring-2 ring-border hover:ring-primary transition-all overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="uppercase">{user.first_name?.[0] || user.email?.[0]}</span>
          )}
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
            <div className="px-3 py-2 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
            
            <div className="p-1 text-sm font-medium">
              <Link
                href={`/${user.role === 'user' ? 'user' : user.role}/dashboard`}
                className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                Dashboard
              </Link>
              <Link
                href="/user/profile"
                className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <UserIcon className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                Profile
              </Link>

              <div className="my-1 h-px bg-border mx-1" />

              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors group"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 text-destructive/70 group-hover:text-destructive transition-colors" />}
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
