"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"

export default function WaitingPage() {
  const [inviteLink, setInviteLink] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const setupWaitingRoom = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        if (authError || !session) {
          throw new Error('Not authenticated')
        }

        console.log('Current user ID:', session.user.id)

        // Get invite link
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

        // Set up polling interval to check for teammate
        const interval = setInterval(async () => {
          const { data: teammateData, error: teammateError } = await supabase
            .from('teammates')
            .select('*')
            .or(`user_id1.eq.${session.user.id},user_id2.eq.${session.user.id}`)
            .single()

          if (teammateData && !teammateError) {
            console.log('Teammate found:', teammateData)
            clearInterval(interval)
            router.push('/dashboard')
          }
        }, 2000) // Check every 2 seconds

        return () => {
          clearInterval(interval)
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
          <Button
            onClick={() => {
              navigator.clipboard.writeText(inviteLink)
              alert('Link copied to clipboard!')
            }}
            className="w-full max-w-md"
          >
            Copy Link
          </Button>
        </div>
      )}
    </div>
  )
} 