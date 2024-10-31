export interface Habit {
  id: number;
  name: string;
  user_id: string;
  streak: number;
  completedDates: string[];
  last_completed?: string;
  description?: string;
  goal?: string;
}

export interface SelectedHabit {
  habitId: string
  goalValue: string
}

export interface InviteLink {
  id: string
  user_id: string
  invite_code: string
  habits: string[]
  expires_at: string
  is_active: boolean
  created_at: string
}

export interface Teammate {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  ready_status: {
    user1: boolean
    user2: boolean
  }
} 