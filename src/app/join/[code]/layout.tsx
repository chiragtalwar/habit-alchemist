"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { code } = useParams()
  const [isValidating, setIsValidating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const { data, error } = await supabase
          .from('invite_links')
          .select('*')
          .eq('invite_code', code)
          .eq('is_active', true)
          .single()

        if (error || !data) {
          throw new Error('Invalid invite link')
        }

        if (new Date(data.expires_at) < new Date()) {
          throw new Error('This invite link has expired')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid invite link')
      } finally {
        setIsValidating(false)
      }
    }

    validateInvite()
  }, [code])

  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Invalid Invite</h1>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return children
} 