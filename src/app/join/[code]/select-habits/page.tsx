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
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      // Get invite data for creator's user_id
      const { data: inviteData } = await supabase
        .from('invite_links')
        .select('user_id')
        .eq('invite_code', params.code)
        .single()

      if (!inviteData) throw new Error('Invalid invite')

      // Create teammate relationship
      await supabase
        .from('teammates')
        .insert({
          user_id1: inviteData.user_id, // creator
          user_id2: session.user.id,     // joiner
          created_at: new Date().toISOString()
        })

      // Insert joiner's habits
      const habitsToInsert = selectedHabits.map(habitId => ({
        user_id: session.user.id,
        name: habitId,
        goal: selectedGoals[habitId]
      }))

      await supabase
        .from('habits')
        .insert(habitsToInsert)

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing setup:', error)
      alert('Failed to complete setup')
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