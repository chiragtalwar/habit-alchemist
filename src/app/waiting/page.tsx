"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from "next/navigation"

export default function WaitingPage() {
  const [inviteLink, setInviteLink] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const setupWaitingRoom = async () => {
      try {
        // Check authentication first
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
          throw new Error('Not authenticated')
        }

        // Get the most recent invite link for the current user
        const { data: inviteData, error: inviteError } = await supabase
          .from('invite_links')
          .select('invite_code')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (inviteError) throw inviteError

        if (inviteData) {
          setInviteLink(`${window.location.origin}/join/${inviteData.invite_code}`)
        }
      } catch (error) {
        console.error('Error setting up waiting room:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    setupWaitingRoom()
  }, [supabase, router])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-2xl py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Waiting for Partner</h1>
      <p className="text-center text-muted-foreground mb-8">
        Share this link with your accountability partner:
      </p>
      {inviteLink && (
        <div className="bg-muted p-4 rounded-md text-center break-all">
          <p className="mb-4">{inviteLink}</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              alert('Link copied to clipboard!')
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  )
} 