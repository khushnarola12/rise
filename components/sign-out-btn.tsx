'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export function SignOutBtn({ className, children }: { className?: string, children?: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signOut } = useClerk()

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    router.push('/')
  }

  return (
    <button 
      onClick={handleSignOut} 
      className={className}
      disabled={loading}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : children || 'Sign Out'}
    </button>
  )
}
