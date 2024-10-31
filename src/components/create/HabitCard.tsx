import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Habit } from "@/types"

interface HabitCardProps {
  habit: Habit
  isSelected: boolean
  selectedGoal?: string
  onSelect: (habitId: string) => void
  onGoalSelect: (habitId: string, goal: string) => void
}

export function HabitCard({
  habit,
  isSelected,
  selectedGoal,
  onSelect,
  onGoalSelect
}: HabitCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start space-x-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(habit.id)}
        />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{habit.name}</h3>
              <p className="text-sm text-muted-foreground">{habit.description}</p>
              <span className="inline-block mt-2 text-xs bg-secondary px-2 py-1 rounded">
                {habit.category}
              </span>
            </div>
            {isSelected && (
              <Select
                value={selectedGoal}
                onValueChange={(value) => onGoalSelect(habit.id, value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  {habit.goals.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
} 