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
  const remaining = modules.length - modulesCompleted - inProgress - inReview;

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

  // Build the summary line, skipping zero-count buckets so it stays clean.
  const parts: string[] = [];
  if (modulesCompleted > 0) parts.push(`${modulesCompleted} done`);
  if (inProgress > 0) parts.push(`${inProgress} in progress`);
  if (inReview > 0) parts.push(`${inReview} in review`);
  if (remaining > 0) parts.push(`${remaining} remaining`);
  const summary = parts.length > 0 ? parts.join(' · ') : 'No modules yet';

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 h-full flex flex-col items-center animate-fade-up">
      <h3 className="text-sm font-semibold text-white mb-4 self-start">Overall Progress</h3>

      <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
        <div className="relative w-44 h-44">
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
            <span className="text-4xl font-bold text-white tracking-tight">
              {displayProgress}
              <span className="text-2xl text-gray-400 font-semibold">%</span>
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center px-2">
          {summary}
        </p>
      </div>
    </div>
  );
}
