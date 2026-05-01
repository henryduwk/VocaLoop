import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
      <div 
        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );
};
