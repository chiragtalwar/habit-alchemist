"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

export function AuthButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Auth error:', error.message)
    }
  }

  return (
    <Button 
      onClick={handleLogin}
      className="w-full"
      size="lg"
    >
      Sign in with Supabase
    </Button>
  )
} 