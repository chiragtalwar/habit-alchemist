export interface PredefinedHabit {
  id: string;
  name: string;
  description: string;
  category: string;
  goals: {
    value: string;
    label: string;
  }[];
}

export const PREDEFINED_HABITS: PredefinedHabit[] = [
  {
    id: 'daily-exercise',
    name: 'Daily Exercise',
    description: 'Stay active and healthy',
    category: 'Health',
    goals: [
      { value: '15 minutes daily', label: '15 minutes' },
      { value: '30 minutes daily', label: '30 minutes' },
      { value: '1 hour daily', label: '1 hour' }
    ]
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Practice mindfulness',
    category: 'Mental Health',
    goals: [
      { value: '5 minutes daily', label: '5 minutes' },
      { value: '10 minutes daily', label: '10 minutes' },
      { value: '20 minutes daily', label: '20 minutes' }
    ]
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Read books or articles',
    category: 'Personal Growth',
    goals: [
      { value: '10 pages daily', label: '10 pages' },
      { value: '20 pages daily', label: '20 pages' },
      { value: '30 pages daily', label: '30 pages' }
    ]
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Express your thoughts',
    category: 'Creativity',
    goals: [
      { value: '100 words daily', label: '100 words' },
      { value: '500 words daily', label: '500 words' },
      { value: '1000 words daily', label: '1000 words' }
    ]
  }
]; 