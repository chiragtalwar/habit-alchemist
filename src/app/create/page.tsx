"use client"

import { useState, useEffect } from "react"
import { HabitList } from "@/components/create/HabitList"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from "next/navigation"
import { PREDEFINED_HABITS } from "@/lib/constants/habits"
import { toast } from "sonner"

export default function CreatePage() {
  const supabase = createClientComponentClient()
  const [selectedHabits, setSelectedHabits] = useState<string[]>([])
  const [selectedGoals, setSelectedGoals] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleHabitSelect = (habitId: string) => {
    setSelectedHabits(prev => 
      prev.includes(habitId)
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    )
  }

  const handleGoalSelect = (habitId: string, goal: string) => {
    setSelectedGoals(prev => ({
      ...prev,
      [habitId]: goal
    }))
  }

  const handleContinue = async () => {
    if (selectedHabits.length === 0) return

    setIsLoading(true)
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Not authenticated')
      }

      // Insert habits - Simplified to match your habits table
      const habitsToInsert = selectedHabits.map(habitId => {
        const predefinedHabit = PREDEFINED_HABITS.find(h => h.id === habitId)
        if (!predefinedHabit) throw new Error(`Habit ${habitId} not found`)
        
        return {
          user_id: user.id,
          name: predefinedHabit.name,
          description: predefinedHabit.description,
          goal: selectedGoals[habitId] || predefinedHabit.goals[0].value
        }
      })

      // Insert into habits table
      const { data: insertedHabits, error: habitsError } = await supabase
        .from('habits')
        .insert(habitsToInsert)
        .select()

      if (habitsError) throw habitsError

      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 15)
      
      // Create invite link
      const { error: inviteError } = await supabase
        .from('invite_links')
        .insert({
          user_id: user.id,
          invite_code: inviteCode,
          habits: selectedHabits,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true
        })

      if (inviteError) throw inviteError

      // Show success message
      alert(`Share this link with your accountability partner:\n${window.location.origin}/join/${inviteCode}`)
      router.push('/waiting')

    } catch (error) {
      console.error('Error saving habits:', error)
      alert('Failed to save habits. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <button 
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/')
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Sign Out (Debug)
      </button>

      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Select Your Habits</h1>
        <p className="text-muted-foreground">
          Choose the habits you want to build with your accountability partner
        </p>
      </div>

      <HabitList
        selectedHabits={selectedHabits}
        selectedGoals={selectedGoals}
        onHabitSelect={handleHabitSelect}
        onGoalSelect={handleGoalSelect}
      />

      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={selectedHabits.length === 0 || isLoading}
          className="w-full max-w-md"
          size="lg"
        >
          {isLoading ? "Creating..." : "Generate Invite Link"}
        </Button>
      </div>
    </div>
  )
}
