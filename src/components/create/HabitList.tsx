import { HabitCard } from "./HabitCard"
import { PREDEFINED_HABITS } from "@/lib/constants/habits"

interface HabitListProps {
  selectedHabits: string[];
  selectedGoals: Record<string, string>;
  onHabitSelect: (habitId: string) => void;
  onGoalSelect: (habitId: string, goal: string) => void;
}

export function HabitList({
  selectedHabits,
  selectedGoals,
  onHabitSelect,
  onGoalSelect
}: HabitListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {PREDEFINED_HABITS.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          isSelected={selectedHabits.includes(habit.id)}
          selectedGoal={selectedGoals[habit.id]}
          onSelect={onHabitSelect}
          onGoalSelect={onGoalSelect}
        />
      ))}
    </div>
  )
} 