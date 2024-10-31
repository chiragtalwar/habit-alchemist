import { HabitCard } from "./HabitCard"
import { predefinedHabits } from "@/data/predefinedHabits"

interface HabitListProps {
  selectedHabits: string[]
  selectedGoals: Record<string, string>
  onToggleHabit: (id: string) => void
  onGoalSelect: (habitId: string, goal: string) => void
}

export function HabitList({ 
  selectedHabits, 
  selectedGoals,
  onToggleHabit,
  onGoalSelect 
}: HabitListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {predefinedHabits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isSelected={selectedHabits.includes(habit.id)}
          onToggle={onToggleHabit}
          onGoalSelect={onGoalSelect}
          selectedGoal={selectedGoals[habit.id]}
        />
      ))}
    </div>
  )
} 