'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { format, subDays } from 'date-fns';
import { Trophy, Sparkles, Crown, Star, Flame } from 'lucide-react';
import { Habit } from '@/types';

interface WeeklySyncProps {
  userHabits: Habit[];
  teammateHabits: Habit[];
}

export function WeeklySync({ userHabits, teammateHabits }: WeeklySyncProps) {
  const today = new Date();
  
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const getDayStatus = (date: Date) => {
    const dayKey = format(date, 'yyyy-MM-dd');
    const userDayHabits = userHabits.filter(habit => 
      habit.completedDates?.includes(dayKey) || false
    );
    const teammateDayHabits = teammateHabits.filter(habit => 
      habit.completedDates?.includes(dayKey) || false
    );

    const userScore = userDayHabits.length;
    const teammateScore = teammateDayHabits.length;
    
    // Calculate the average completion percentage
    const totalPossible = userHabits.length + teammateHabits.length;
    const totalCompleted = userScore + teammateScore;
    const syncLevel = totalPossible > 0 
      ? Math.round((totalCompleted / totalPossible) * 100) 
      : 0;

    const isFullSync = userScore === userHabits.length && 
                      teammateScore === teammateHabits.length;

    return {
      userScore,
      teammateScore,
      syncLevel,
      isFullSync
    };
  };

  // Add new function to calculate super streak
  const calculateSuperStreak = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    for (let i = last7Days.length - 1; i >= 0; i--) {
      const date = last7Days[i];
      const { userScore, teammateScore } = getDayStatus(date);
      
      if (userScore === userHabits.length && teammateScore === teammateHabits.length) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    return currentStreak;
  };

  const currentSuperStreak = calculateSuperStreak();

  return (
    <motion.div className="mx-auto w-[520px] relative mb-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1A2942] to-[#0F1829] shadow-2xl border border-[#F0E6D2]/20">
        {/* Ambient Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-[#F0E6D2]/10 via-transparent to-transparent opacity-60" />
        
        {/* Header with Sync Icon */}
        <div className="relative px-5 py-3 flex items-center justify-between border-b border-[#F0E6D2]/10">
          <div className="flex items-center gap-2">
            <h3 className="text-[#F0E6D2] text-base font-semibold tracking-wide">Weekly Sync</h3>
            <Sparkles className="w-4 h-4 text-[#F0E6D2]/70" />
          </div>
          
          {/* Stats Container - Increased width and adjusted padding */}
          <div className="flex items-center gap-4 bg-[#2A3F6C]/80 px-4 py-1.5 rounded-full border border-[#F0E6D2]/10">
            {/* You Stats */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8D9CAF]">YOU</span>
              <span className="text-xs font-medium text-[#F0E6D2]">{userHabits.length}/{userHabits.length}</span>
            </div>

            {/* Divider */}
            <div className="h-3 w-px bg-[#F0E6D2]/10" />

            {/* Ally Stats */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8D9CAF]">ALLY</span>
              <span className="text-xs font-medium text-[#F0E6D2]">{teammateHabits.length}/{teammateHabits.length}</span>
            </div>

            {/* Super Streak */}
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#8D9CAF]" />
              <span className="text-xs text-[#8D9CAF]">{currentSuperStreak}</span>
            </div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="relative p-4 flex items-end justify-between gap-2">
          {last7Days.map((date, index) => {
            const { userScore, teammateScore, syncLevel, isFullSync } = getDayStatus(date);
            const isToday = index === last7Days.length - 1;
            const isPerfect = syncLevel === 100;
            
            return (
              <motion.div
                key={date.toISOString()}
                className="relative group flex-1"
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Luxurious Glow Effects for 100% */}
                {isPerfect && (
                  <>
                    {/* Outer cream glow */}
                    <motion.div 
                      className="absolute -inset-2 bg-[#F0E6D2]/20 rounded-xl blur-xl"
                      animate={{ 
                        opacity: [0.4, 0.7, 0.4],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    {/* Inner bright glow */}
                    <motion.div 
                      className="absolute -inset-1 bg-[#F0E6D2]/30 rounded-lg blur-md"
                      animate={{ 
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Shimmering overlay */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-[#F0E6D2]/40 via-transparent to-[#F0E6D2]/20 rounded-lg"
                      animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </>
                )}

                {/* Main Column */}
                <div className={`
                  relative overflow-hidden rounded-lg h-[50px]
                  ${isPerfect 
                    ? 'bg-gradient-to-b from-[#F0E6D2]/30 via-[#2A3F6C] to-[#1D2D4F] border border-[#F0E6D2]/40' 
                    : 'bg-[#1D2D4F]/40'}
                  transform transition-all duration-300
                  ${isPerfect ? 'shadow-lg shadow-[#F0E6D2]/20' : ''}
                `}>
                  {/* Animated Fill for 100% */}
                  {isPerfect && (
                    <>
                      {/* Cream waves effect */}
                      <motion.div
                        className="absolute inset-0 opacity-50"
                        style={{
                          background: 'radial-gradient(circle, rgba(240,230,210,0.3) 0%, transparent 70%)',
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      {/* Rising particles */}
                      <div className="absolute inset-0">
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-0.5 h-0.5 bg-[#F0E6D2] rounded-full"
                            style={{
                              left: `${20 * i + 10}%`,
                            }}
                            animate={{
                              y: [0, -20],
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                              ease: "easeOut",
                            }}
                          />
                        ))}
                      </div>

                      {/* Shimmering lines */}
                      <motion.div
                        className="absolute inset-0 overflow-hidden"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(240,230,210,0.2), transparent)',
                          backgroundSize: '200% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['100% 0', '-100% 0'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </>
                  )}

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-between py-2">
                    <motion.div
                      className={`text-sm font-bold ${isPerfect ? 'text-[#F0E6D2]' : 'text-[#8D9CAF]'}`}
                    >
                      {syncLevel}%
                    </motion.div>
                    
                    <span className={`text-[10px] uppercase tracking-wider ${
                      isPerfect ? 'text-[#F0E6D2] font-semibold' : 'text-[#8D9CAF]'
                    }`}>
                      {format(date, 'EEE')}
                    </span>
                  </div>

                  {/* Achievement Crown */}
                  {isPerfect && (
                    <motion.div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                      animate={{ 
                        y: [0, -3, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 blur-lg bg-yellow-400/40"
                          animate={{
                            opacity: [0.4, 0.8, 0.4],
                            scale: [1, 1.3, 1],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <Crown className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Tooltip */}
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 pointer-events-none select-none z-50">
                  <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-[#1A2942]/95 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#F0E6D2]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                      <div className="flex items-center gap-3 whitespace-nowrap">
                        {/* Your Progress */}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F0E6D2]/50" />
                          <span className="text-[10px] text-[#8D9CAF] uppercase tracking-wide font-medium">You</span>
                          <span className={`text-xs font-semibold ${
                            userScore === userHabits.length ? 'text-[#F0E6D2]' : 'text-[#8D9CAF]'
                          }`}>
                            {userScore}/{userHabits.length}
                          </span>
                        </div>
                        
                        {/* Ally Progress */}
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F0E6D2]/50" />
                          <span className="text-[10px] text-[#8D9CAF] uppercase tracking-wide font-medium">Ally</span>
                          <span className={`text-xs font-semibold ${
                            teammateScore === teammateHabits.length ? 'text-[#F0E6D2]' : 'text-[#8D9CAF]'
                          }`}>
                            {teammateScore}/{teammateHabits.length}
                          </span>
                        </div>

                        {/* Perfect Sync Indicator */}
                        {isPerfect && (
                          <div className="flex items-center gap-1.5">
                            <div className="h-3 w-px bg-[#F0E6D2]/20" />
                            <div className="flex items-center gap-1 bg-[#F0E6D2]/10 px-2 py-0.5 rounded-full">
                              <Sparkles className="w-3 h-3 text-[#F0E6D2]" />
                              <span className="text-[10px] text-[#F0E6D2] font-medium">
                                Perfect!
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tooltip Arrow */}
                    <div className="absolute left-1/2 -bottom-2 -translate-x-1/2">
                      <div className="relative w-3 h-3 rotate-45 bg-[#1A2942]/95 border-r border-b border-[#F0E6D2]/20 shadow-lg" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
