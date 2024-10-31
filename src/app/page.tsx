"use client"

import { AuthForm } from '@/components/auth/AuthForm'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/create')
      }
    }
    checkUser()
  }, [router, supabase.auth])

  return (
    <div className="container mx-auto max-w-[400px] py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Habit Alchemist</h1>
        <p className="text-muted-foreground">
          Transform your habits with team accountability.
        </p>
      </div>
      <AuthForm />
    </div>
  )
}
