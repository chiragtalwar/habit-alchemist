'use client'  // Add this at the top to make it a Client Component

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion';
import { DualCalendar } from '@/components/DualCalendar';
import { ProgressMountain } from '@/components/ProgressMountain';
import { TeammateSummary } from '@/components/TeammateSummary';
import { Habit } from '@/types';
import { Sun, Moon, Flame, Star } from 'lucide-react';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { WeeklySync } from '@/components/WeeklySync';
import { addDays } from 'date-fns';
  
// Add this interface definition
interface DualCalendarProps {
  title?: string;
  habits: Habit[];
  onMarkComplete?: (habitId: number) => void;
  isReadOnly?: boolean;
  theme?: string;
}

// Add this interface at the top of your file, after the other interfaces
interface TeammateData {
  name: string;
  level: number;
}

// Add these interfaces at the top of the file
interface JourneyData {
  startDate: Date;
  endDate: Date;
  currentDay: number;
}

interface TeamJourney {
  id: string;
  team_id: number;  // bigint from database comes as number in JS
  start_date: string;
  created_at: string;
}

// Add this function before your Dashboard component
const calculateStreak = (completedDates: string[]): number => {
  if (completedDates.length === 0) return 0;

  // Remove duplicates and sort dates in descending order
  const sortedDates = Array.from(new Set(completedDates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date().toISOString().split('T')[0];
  let streak = 0;
  let currentDate = new Date(today);

  for (const date of sortedDates) {
    const completionDate = new Date(date);     
    const daysDifference = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0 || daysDifference === 1) {
      streak++;
      currentDate = completionDate;
    } else {
      break;
    }
  }

  return streak;
};

const updateStreak = (habit: Habit): number => {
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = [...habit.completedDates, today].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 1;
  let lastDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const dayDifference = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (dayDifference === 1) {
      streak++;
      lastDate = currentDate;
    } else if (dayDifference > 1) {
      break;
    }
  }

  return streak;
};

export default function Dashboard() {
  const [journeyData, setJourneyData] = useState<JourneyData>({
    startDate: new Date(),
    endDate: addDays(new Date(), 21),
    currentDay: 1
  });
  const [userHabits, setUserHabits] = useState<Habit[]>([]);
  const [teammateHabits, setTeammateHabits] = useState<Habit[]>([]);
  const [ambrosiaPoints, setAmbrosiaPoints] = useState(0);  
  const [level, setLevel] = useState(1);
  const [dailyQuote, setDailyQuote] = useState('');
  const [theme, setTheme] = useState('light');
  const [showCompletionEffect, setShowCompletionEffect] = useState(false);
  const [teammateData, setTeammateData] = useState<TeammateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/');
          return;
        }

        // Check if user has a team
        const { data: teammateData, error: teammateError } = await supabase
          .from('teammates')
          .select('*')
          .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
          .maybeSingle();

        if (teammateError) {
          console.error('Error checking teammate status:', teammateError);
          setError('Failed to load teammate data');
          setIsLoading(false);
          return;
        }

        // Instead of redirecting to find-teammate, just show loading or empty state
        if (!teammateData || (!teammateData.user_id1 || !teammateData.user_id2)) {
          setIsLoading(false);
          setError('No teammate found. Please wait for your partner to join.');
          return;
        }

        setIsLoading(false);
        fetchData();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Failed to check authentication status');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('team_updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'team_journeys',
      }, () => {
        fetchData(); // Refresh dashboard data
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      // 2. Check if user is part of a team
      const { data: teammateData, error: teammateError } = await supabase
        .from('teammates')
        .select('*')
        .or(`user_id1.eq.${user.id},user_id2.eq.${user.id}`)
        .single();

      if (teammateError) {
        if (teammateError.code === 'PGRST116') {
          // Instead of redirecting, handle the no-teammate state
          setError('Waiting for your partner to join.');
          setIsLoading(false);
          return;
        }
        throw teammateError;
      }

      // 3. Get or create team journey
      const { data: journeyData, error: journeyError } = await supabase
        .from('team_journeys')
        .select('start_date, created_at')
        .eq('team_id', teammateData.id)
        .single();

      if (journeyError && journeyError.code === 'PGRST116') {
        // Only create journey if one doesn't exist
        const startDate = new Date();
        const { data: newJourney, error: createError } = await supabase
          .from('team_journeys')
          .insert({
            team_id: teammateData.id,
            start_date: startDate.toISOString(),
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        setJourneyData({
          startDate,
          endDate: addDays(startDate, 21),
          currentDay: 1,
        });
      } else if (journeyError) {
        throw journeyError;
      } else {
        // Journey exists, calculate current day
        const startDate = new Date(journeyData.start_date);
        const endDate = addDays(startDate, 21);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const currentDay = Math.min(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 21);

        setJourneyData({
          startDate,
          endDate,
          currentDay,
        });
      }

      // 4. Fetch user's habits
      const { data: userHabitsData, error: userHabitsError } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions (completed_date)
        `)
        .eq('user_id', user.id);

      if (userHabitsError) throw userHabitsError;
      setUserHabits(processHabitsData(userHabitsData));

      // 5. Fetch teammate's habits
      const teammateId = teammateData.user_id1 === user.id 
        ? teammateData.user_id2 
        : teammateData.user_id1;

      const { data: teammateHabitsData, error: teammateHabitsError } = await supabase
        .from('habits')
        .select(`
          *,
          habit_completions (completed_date)
        `)
        .eq('user_id', teammateId);

      if (teammateHabitsError) throw teammateHabitsError;
      setTeammateHabits(processHabitsData(teammateHabitsData));

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const processHabitsData = (habitsData: any[]): Habit[] => {
    return habitsData.map(habit => ({
      id: habit.id,
      name: habit.name,
      user_id: habit.user_id,
      streak: calculateStreak(habit.habit_completions.map((c: any) => c.completed_date)),
      completedDates: habit.habit_completions.map((c: any) => c.completed_date),
      last_completed: habit.habit_completions.length > 0 
        ? habit.habit_completions[habit.habit_completions.length - 1].completed_date 
        : undefined
    }));
  };

  const markHabitComplete = async (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const habit = userHabits.find(h => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      // Check if the habit has already been completed today
      if (habit.completedDates.includes(today)) {
        console.log('Habit already completed today');
        return; // Exit the function if already completed today
      }

      // Insert new completion
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({ habit_id: habitId, completed_date: today })
        .single();

      if (error) throw error;

      // Update local state
      setUserHabits(prevHabits =>
        prevHabits.map(h =>
          h.id === habitId
            ? {
                ...h,
                completedDates: [...h.completedDates, today],
                streak: calculateStreak([...h.completedDates, today]),
                last_completed: today
              }
            : h
        )
      );

      // Show completion effect and update Ambrosia points only for new completions
      setShowCompletionEffect(true);
      setTimeout(() => setShowCompletionEffect(false), 2000);
      setAmbrosiaPoints(prev => prev + 10);

    } catch (error) {
      console.error('Error marking habit complete:', error);
      // Optionally, show an error message to the user
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-4">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1622] via-[#152238] to-[#1D2D4F] text-[#E6D7BE]">
      <motion.div 
        className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <header className="mb-16 flex justify-between items-center">
          <motion.h1 
            className="text-5xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#F0E6D2] to-[#C9B28F]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Your Olympian Journey
          </motion.h1>

          {/* Enhanced Journey Counter */}
          <motion.div 
            className="relative group"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {/* Main Container */}
            <div className="relative flex items-center gap-8 bg-[#1A2942]/60 backdrop-blur-sm px-8 py-5 rounded-xl border border-[#F0E6D2]/10">
              {/* Day Counter */}
              <div className="relative flex flex-col items-center">
                <span className="text-xs text-[#8D9CAF] uppercase tracking-wider font-medium">Day</span>
                <div className="relative">
                  <motion.div
                    className="absolute -inset-2 bg-[#F0E6D2]/5 rounded-full blur-lg"
                    animate={{
                      opacity: [0.2, 0.3, 0.2],
                      scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="relative text-3xl font-bold text-[#F0E6D2]">{journeyData.currentDay}</span>
                </div>
                <span className="text-sm text-[#8D9CAF]">of 21</span>
              </div>

              {/* Magical Star Container */}
              <div className="relative w-20 h-20">
                {/* Subtle Background Ring */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F0E6D2]/10 to-[#C9B28F]/10"
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.3, 0.2],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Central Star */}
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    {/* Very Subtle Glow */}
                    <motion.div
                      className="absolute -inset-2 bg-[#F0E6D2]/10 rounded-full blur-md"
                      animate={{
                        opacity: [0.1, 0.2, 0.1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <Star 
                      className="w-10 h-10 text-[#F0E6D2] drop-shadow-[0_0_3px_rgba(240,230,210,0.3)]" 
                      strokeWidth={1.5}
                      fill="#F0E6D2"
                    />
                  </div>
                </motion.div>

                {/* Minimal Star Trails */}
                {journeyData.currentDay === 21 && (
                  <motion.div 
                    className="absolute inset-0"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 30,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-0.5 h-0.5 bg-[#F0E6D2]/30"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${i * 60}deg) translateX(32px)`,
                        }}
                        animate={{
                          opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Subtle Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-[#1A2942]/90 backdrop-blur px-3 py-1.5 rounded-lg border border-[#F0E6D2]/10 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-[#F0E6D2]/70" />
                  <span className="text-xs text-[#F0E6D2]/90">
                    {journeyData.currentDay === 21 
                      ? "Journey completed" 
                      : `${21 - journeyData.currentDay} days remaining`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </header>
        
        <main>
          <section className="flex flex-col gap-6">
            <WeeklySync userHabits={userHabits} teammateHabits={teammateHabits} />
            <div className="grid grid-cols-2 gap-6 mb-8">
              <DualCalendar 
                title="Your Journey" 
                habits={userHabits} 
                onMarkComplete={markHabitComplete}
                theme={theme}
              />
              <DualCalendar 
                title="Ally's Endeavors" 
                habits={teammateHabits} 
                isReadOnly={true}
                theme={theme}
              />
            </div>
          </section>
        </main>

        <AnimatePresence>
          {showCompletionEffect && (
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F0E6D2] text-[#0B1622] p-6 rounded-lg shadow-xl text-2xl font-bold"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              Quest Completed! +10 Ambrosia Points
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
