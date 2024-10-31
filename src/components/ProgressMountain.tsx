import React from 'react';
import { motion } from 'framer-motion';

interface ProgressMountainProps {
  level: number;
}

export const ProgressMountain: React.FC<ProgressMountainProps> = ({ level }) => {
  const maxLevel = 10; // Adjust as needed
  const progress = (level / maxLevel) * 100;

  return (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h2 className="text-2xl mb-2">Your Progress</h2>
      <div className="relative h-64 bg-gray-700 rounded-lg overflow-hidden">
        <motion.div
          className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-purple-500"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">Level {level}</span>
        </div>
      </div>
    </div>
  );
};

