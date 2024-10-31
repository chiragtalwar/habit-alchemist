"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuthForm } from "@/components/auth/AuthForm"

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isValidInvite, setIsValidInvite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkInvite = async () => {
      try {
        // Check if invite code exists and is valid
        const { data: invite, error } = await supabase
          .from('invite_links')
          .select('*')
          .eq('invite_code', params.code)
          .single()

        if (error || !invite) {
          throw new Error('Invalid invite link')
        }

        setIsValidInvite(true)
      } catch (error) {
        console.error('Error checking invite:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    checkInvite()
  }, [params.code, router, supabase])

  if (isLoading) {
    return <div>Checking invite...</div>
  }

  if (!isValidInvite) {
    return <div>Invalid invite link</div>
  }

  return (
    <div className="container mx-auto max-w-[400px] py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Join Your Partner</h1>
        <p className="text-muted-foreground">
          Sign in or create an account to join your accountability partner
        </p>
      </div>
      <AuthForm redirectPath={`/join/${params.code}/select-habits`} />
    </div>
  )
} 