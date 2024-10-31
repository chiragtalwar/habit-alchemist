import React from 'react';

interface TeammateSummaryProps {
  teammateName: string;
  teammateLevel: number;
}

export const TeammateSummary: React.FC<TeammateSummaryProps> = ({ teammateName, teammateLevel }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-2xl mb-2">Teammate</h2>
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-2xl">
          {teammateName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-xl">{teammateName}</p>
          <p className="text-gray-400">Level {teammateLevel}</p>
        </div>
      </div>
    </div>
  );
};
