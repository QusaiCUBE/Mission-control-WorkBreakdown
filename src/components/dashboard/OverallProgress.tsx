import { useState, useEffect } from 'react';
import { Module } from '../../types';
import { getOverallProgress, getModulesCompleted } from '../../utils/progress';

interface OverallProgressProps {
  modules: Module[];
}

export default function OverallProgress({ modules }: OverallProgressProps) {
  const progress = getOverallProgress(modules);
  const modulesCompleted = getModulesCompleted(modules);
  const inProgress = modules.filter((m) => m.status === 'in_progress').length;
  const inReview = modules.filter((m) => m.status === 'in_review').length;
  const remaining = modules.length - modulesCompleted;

  const circumference = 2 * Math.PI * 45;

  const [displayProgress, setDisplayProgress] = useState(0);
  const [ringOffset, setRingOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRingOffset(circumference - (progress / 100) * circumference);
    }, 200);

    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      const t = frame / totalFrames;
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayProgress(Math.round(progress * eased));
      if (frame >= totalFrames) {
        setDisplayProgress(progress);
        clearInterval(interval);
      }
    }, 25);

    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [progress, circumference]);

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 h-full flex flex-col animate-fade-up">
      <h3 className="text-sm font-semibold text-white mb-4">Overall Progress</h3>

      <div className="flex-1 flex items-center gap-5">
        {/* Donut */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#242836" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#00B894"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{displayProgress}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 min-w-0 grid grid-cols-2 gap-y-2 gap-x-3">
          <Stat label="Done" value={modulesCompleted} color="#00B894" />
          <Stat label="In Progress" value={inProgress} color="#F39C12" />
          <Stat label="In Review" value={inReview} color="#6C5CE7" />
          <Stat label="Remaining" value={remaining} color="#6B7280" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-6 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
      <div className="min-w-0">
        <div className="text-base font-semibold text-white leading-none">{value}</div>
        <div className="text-[10px] text-gray-500 mt-0.5 truncate">{label}</div>
      </div>
    </div>
  );
}
