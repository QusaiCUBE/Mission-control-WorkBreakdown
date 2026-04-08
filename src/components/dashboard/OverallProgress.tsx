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

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-bg-secondary border border-border-primary rounded-xl p-5 flex flex-col items-center">
      <h3 className="text-sm font-semibold text-white mb-4 self-start">Overall Progress</h3>

      <div className="relative w-28 h-28">
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
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{progress}%</span>
        </div>
      </div>

      <div className="mt-4 text-center space-y-1">
        <p className="text-xs text-gray-400">
          {modulesCompleted} of {modules.length} modules done
        </p>
        {(inProgress > 0 || inReview > 0) && (
          <p className="text-xs text-gray-500">
            {inProgress > 0 && `${inProgress} in progress`}
            {inProgress > 0 && inReview > 0 && ', '}
            {inReview > 0 && `${inReview} in review`}
          </p>
        )}
      </div>
    </div>
  );
}
