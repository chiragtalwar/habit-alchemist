"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { HabitList } from "@/components/create/HabitList"
import { Button } from "@/components/ui/button"

export default function SelectHabitsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [creatorHabits, setCreatorHabits] = useState<string[]>([])

  useEffect(() => {
    const loadInviteData = async () => {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push(`/join/${params.code}`)
          return
        }

        // Get invite data
        const { data: inviteData, error: inviteError } = await supabase
          .from('invite_links')
          .select('habits, user_id')
          .eq('invite_code', params.code)
          .single()

        if (inviteError) throw inviteError
        setCreatorHabits(inviteData.habits)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading invite data:', error)
        router.push('/')
      }
    }

    loadInviteData()
  }, [params.code, router, supabase])

  const handleComplete = async () => {
    if (selectedHabits.length === 0) return

    setIsLoading(true)
    try {
      // 1. Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('Not authenticated')
      }

      // 2. Get invite data with detailed logging
      const { data: inviteData, error: inviteError } = await supabase
        .from('invite_links')
        .select('*')  // Select all fields for debugging
        .eq('invite_code', params.code)
        .single()

      if (inviteError || !inviteData) {
        console.error('Invite error:', inviteError)
        throw new Error('Invalid invite')
      }

      console.log('Invite data:', inviteData)  // Debug log

      // 3. Create teammate relationship with explicit values
      const teammateData = {
        user_id1: inviteData.user_id,
        user_id2: session.user.id,
        status: 'active',
        created_at: new Date().toISOString()
      }

      console.log('Attempting to create teammate with:', teammateData)  // Debug log

      const { error: teammateError } = await supabase
        .from('teammates')
        .insert(teammateData)

      if (teammateError) {
        console.error('Teammate creation error:', teammateError)
        throw teammateError
      }

      // 4. Insert habits for the joiner
      const habitsToInsert = selectedHabits.map(habitId => ({
        user_id: session.user.id,
        name: habitId,
        goal: selectedGoals[habitId] || '30 minutes',
        created_at: new Date().toISOString()
      }))

      const { error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToInsert)

      if (habitsError) {
        console.error('Habits creation error:', habitsError)
        throw habitsError
      }

      // 5. Deactivate the invite link
      const { error: updateError } = await supabase
        .from('invite_links')
        .update({ is_active: false })
        .eq('invite_code', params.code)

      if (updateError) {
        console.error('Invite update error:', updateError)
        // Don't throw here, not critical
      }

      // Success! Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Complete setup error:', error)
      alert('Failed to complete setup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Select Your Habits</h1>
        <p className="text-muted-foreground">
          Choose the habits you want to build with your accountability partner
        </p>
      </div>

      <HabitList
        selectedHabits={selectedHabits}
        selectedGoals={selectedGoals}
        onHabitSelect={habitId => {
          setSelectedHabits(prev => {
            if (prev.includes(habitId)) {
              return prev.filter(id => id !== habitId)
            }
            return [...prev, habitId]
          })
        }}
        onGoalSelect={(habitId, goal) => {
          setSelectedGoals(prev => ({
            ...prev,
            [habitId]: goal
          }))
        }}
      />

      <div className="flex justify-center">
        <Button
          onClick={handleComplete}
          disabled={selectedHabits.length === 0 || isLoading}
          className="w-full max-w-md"
          size="lg"
        >
          {isLoading ? "Setting up..." : "Complete Setup"}
        </Button>
      </div>
    </div>
  )
}