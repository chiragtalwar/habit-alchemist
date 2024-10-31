'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, subDays, isWithinInterval } from "date-fns";
import { Flame, CheckCircle, Trophy, BookOpen, Pencil, BookMarked, Dumbbell } from "lucide-react";
import { Habit } from '@/types';

// Define the DualCalendarProps interface
interface DualCalendarProps {
  title?: string;
  habits: Habit[];
  onMarkComplete?: (habitId: number) => void;
  isReadOnly?: boolean;
  theme?: string;
}

export const DualCalendar: React.FC<DualCalendarProps> = ({ title, habits, onMarkComplete, isReadOnly = false }) => {
  const [localHabits, setLocalHabits] = useState(habits);

  const handleComplete = async (habitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const habit = localHabits.find(h => h.id === habitId);
    
    // Check if already completed today
    if (habit?.completedDates.some(date => 
      new Date(date).toISOString().split('T')[0] === today
    )) {
      return;
    }

    if (onMarkComplete && !isReadOnly) {
      await onMarkComplete(habitId);
      setLocalHabits(prevHabits => 
        prevHabits.map(habit => 
          habit.id === habitId 
            ? { 
                ...habit, 
                last_completed: new Date().toISOString(),
                completedDates: [...habit.completedDates, new Date().toISOString()],
                streak: habit.streak + 1
              } 
            : habit
        )
      );
    }
  };

  const renderCalendar = (habit: Habit) => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const isPerfectWeek = habit.completedDates.filter(date => 
      isWithinInterval(new Date(date), { start: subDays(today, 6), end: today })
    ).length === 7;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2" style={{ 
          gridTemplateRows: 'repeat(5, 1fr)',
          minHeight: '11rem' 
        }}>
          {days.map((day, index) => {
            const isCompleted = habit.completedDates.some(date => isSameDay(new Date(date), day));
            const isFuture = day > today;
            return (
              <motion.div
                key={day.toISOString()}
                className={`w-9 h-9 flex items-center justify-center text-sm rounded-full
                  ${isCompleted 
                    ? 'bg-gradient-to-br from-[#F0E6D2] to-[#C9B28F] text-[#0B1622] font-semibold' 
                    : isFuture 
                      ? 'bg-[#1D2D4F] text-[#8D9CAF]' 
                      : 'bg-[#152238] text-[#B8C5D6]'}
                  ${isToday(day) ? 'ring-2 ring-[#F0E6D2] ring-opacity-70' : ''}
                `}
                whileHover={{ scale: 1.1, boxShadow: '0 0 12px rgba(240, 230, 210, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                animate={isCompleted ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {format(day, 'd')}
              </motion.div>
            )
          })}
        </div>
        {isPerfectWeek && (
          <motion.div 
            className="flex items-center justify-center text-[#F0E6D2] bg-[#1D2D4F] p-2 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="w-5 h-5 mr-2 text-[#FFD700]" />
            Perfect Week!
          </motion.div>
        )}
      </div>
    )
  }

  // Add this helper function
  const isCompletedToday = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.some(date => 
      new Date(date).toISOString().split('T')[0] === today
    );
  };

  // Add this helper function to get the appropriate icon
  const getHabitIcon = (habitName: string) => {
    switch (habitName.toLowerCase()) {
      case 'learn':
        return <BookOpen className="w-5 h-5 text-[#F0E6D2]/70" />;
      case 'write':
        return <Pencil className="w-5 h-5 text-[#F0E6D2]/70" />;
      case 'read':
        return <BookMarked className="w-5 h-5 text-[#F0E6D2]/70" />;
      case 'exercise':
        return <Dumbbell className="w-5 h-5 text-[#F0E6D2]/70" />;
      default:
        return null;
    }
  };

  // Add this helper function
  const getProgressMetrics = (habit: Habit) => {
    const completedDays = habit.completedDates.length;
    const totalDays = 21; // Your target days
    const progressPercentage = Math.round((completedDays / totalDays) * 100);
    
    return {
      completedDays,
      totalDays,
      progressPercentage
    };
  };

  const getProgressMessage = (habit: Habit) => {
    const completedDays = habit.completedDates.length;
    
    type MessageType = {
      text: string;
      icon: JSX.Element;
      bgGradient: string;
      iconGlow: string;
      emoji?: string;
    };

    type MessagesType = {
      [key: string]: MessageType;
    };
    
    const messages: MessagesType = {
      learn: {
        text: `${completedDays} learning quests`,
        icon: <BookOpen className="w-4 h-4 text-amber-200" />,
        bgGradient: 'from-[#785A28]/20 to-[#463714]/20',
        iconGlow: 'amber-400',
      },
      write: {
        text: `${completedDays} writing adventures`,
        icon: <Pencil className="w-4 h-4 text-emerald-200" />,
        bgGradient: 'from-[#785A28]/20 to-[#463714]/20',
        iconGlow: 'emerald-400',
      },
      read: {
        text: `${completedDays} chapters explored`,
        icon: <BookMarked className="w-4 h-4 text-violet-200" />,
        bgGradient: 'from-[#785A28]/20 to-[#463714]/20',
        iconGlow: 'violet-400',
      },
      exercise: {
        text: `${completedDays} workouts crushed`,
        icon: <Dumbbell className="w-4 h-4 text-amber-200" />,
        bgGradient: 'from-[#785A28]/20 to-[#463714]/20',
        iconGlow: 'amber-400',
      }
    };

    const defaultMessage: MessageType = {
      text: `${completedDays} days completed`,
      icon: <CheckCircle className="w-4 h-4 text-blue-200" />,
      bgGradient: 'from-blue-400/20 to-blue-600/20',
      iconGlow: 'blue-400',
      emoji: "⭐"
    };

    return messages[habit.name.toLowerCase()] || defaultMessage;
  };

  return (
    <motion.div 
      className="rounded-xl overflow-hidden bg-gradient-to-br from-[#152238] to-[#1D2D4F] shadow-2xl h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="py-5 px-7 bg-gradient-to-r from-[#F0E6D2] to-[#C9B28F]">
        <h2 className="text-2xl font-serif font-bold text-[#0B1622]">{title}</h2>
        <p className="text-sm text-[#152238] opacity-80 mt-1">Track your legendary feats</p>
      </div>
      <div className="p-7 flex-1 flex flex-col gap-6">
        {localHabits.map((habit, index) => (
          <motion.div 
            key={habit.id}
            className="flex-1 flex flex-col p-6 rounded-xl shadow-lg backdrop-blur-sm
              bg-gradient-to-br from-[#1D2D4F]/90 via-[#1A2844]/80 to-[#152238]/70
              border border-[#F0E6D2]/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              boxShadow: '0 0 25px rgba(240, 230, 210, 0.15)',
              background: 'linear-gradient(135deg, rgba(29, 45, 79, 0.95), rgba(26, 40, 68, 0.85), rgba(21, 34, 56, 0.75))',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#F0E6D2]/5 to-transparent opacity-50 rounded-xl" />
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="relative p-2 bg-[#152238] rounded-lg">
                  <motion.div
                    className="absolute inset-0 bg-[#F0E6D2]/5 rounded-lg blur-lg"
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {getHabitIcon(habit.name)}
                </div>
                <span className="font-serif text-2xl font-medium text-[#F0E6D2] tracking-wide">
                  {habit.name}
                </span>
              </div>
              
              <motion.div 
                className="flex items-center gap-2 bg-[#152238] px-3 py-1.5 rounded-full"
                animate={habit.streak > 0 ? {
                  scale: [1, 1.05, 1],
                  transition: { duration: 2, repeat: Infinity }
                } : {}}
              >
                <Flame className="w-4 h-4 text-[#FF6B35]" />
                <span className="text-sm font-medium text-[#F0E6D2]">
                  {habit.streak} day streak
                </span>
              </motion.div>
            </div>

            {renderCalendar(habit)}

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#F0E6D2]/10">
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-[#F0E6D2]">
                  {(() => {
                    const { text, icon, bgGradient, iconGlow, emoji } = getProgressMessage(habit);
                    return (
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className={`relative p-3 rounded-xl bg-gradient-to-br ${bgGradient}`}
                          whileHover={{ scale: 1.05 }}
                          animate={{
                            boxShadow: [
                              `0 0 0 rgba(var(--${iconGlow}-rgb), 0.4)`,
                              `0 0 20px rgba(var(--${iconGlow}-rgb), 0.2)`,
                              `0 0 0 rgba(var(--${iconGlow}-rgb), 0.4)`
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/5 rounded-xl blur-md"
                            animate={{
                              opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          {icon}
                        </motion.div>

                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <motion.span 
                              className="text-sm font-medium text-[#E6DCC6] tracking-wide"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              {text}
                            </motion.span>
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 400,
                                damping: 10,
                                delay: 0.3
                              }}
                            >
                              {emoji}
                            </motion.span>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <div className="relative w-40 h-1.5 bg-[#1A2333] rounded-full overflow-hidden">
                              <motion.div 
                                className={`absolute inset-0 bg-gradient-to-r ${bgGradient} opacity-20`}
                                animate={{
                                  x: ['-100%', '100%'],
                                }}
                                transition={{ 
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              />
                              <motion.div 
                                className={`h-full bg-gradient-to-r from-[#E6DCC6] to-[#D4C4A8]`}
                                initial={{ width: 0 }}
                                animate={{ width: `${(habit.completedDates.length / 21) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                              />
                            </div>
                            <motion.div
                              className="text-xs text-[#8D9CAF] font-medium"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              {Math.round((habit.completedDates.length / 21) * 100)}% towards your goal
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
              {!isReadOnly && (
                <motion.button
                  className={`relative z-10 rounded-full px-4 py-2 flex items-center shadow-lg ${
                    isCompletedToday(habit)
                      ? 'bg-gradient-to-r from-[#8B9B8B] to-[#A3B1A3] text-[#4A4A4A] cursor-not-allowed opacity-75'
                      : 'bg-gradient-to-r from-[#F0E6D2] to-[#C9B28F] text-[#0B1622] font-semibold'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete(habit.id);
                  }}
                  whileHover={!isCompletedToday(habit) ? { scale: 1.05, boxShadow: '0 0 15px rgba(240, 230, 210, 0.4)' } : {}}
                  whileTap={!isCompletedToday(habit) ? { scale: 0.98 } : {}}
                  disabled={isCompletedToday(habit)}
                >
                  {isCompletedToday(habit) ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
