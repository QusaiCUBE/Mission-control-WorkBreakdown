import { useState, useEffect } from 'react';
import { Module } from '../../types';
import { getOverallProgress, getModulesCompleted } from '../../utils/progress';

interface OverallProgressProps {
  modules: Module[];
}

interface Segment {
  count: number;
  color: string;
  label: string;
}

export default function OverallProgress({ modules }: OverallProgressProps) {
  const overallProgress = getOverallProgress(modules);
  const done = getModulesCompleted(modules);
  const inReview = modules.filter((m) => m.status === 'in_review').length;
  const inProgress = modules.filter((m) => m.status === 'in_progress').length;
  const remaining = Math.max(0, modules.length - done - inReview - inProgress);
  const total = modules.length || 1;

  // Segments are drawn in order around the circle. Remaining is intentionally
  // omitted — the unfilled track represents it.
  const segments: Segment[] = [
    { count: done, color: '#00B894', label: 'done' },          // green
    { count: inReview, color: '#6C5CE7', label: 'in review' }, // purple
    { count: inProgress, color: '#F39C12', label: 'in progress' }, // amber
  ];

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Animate the percentage count-up. Segment lengths use a CSS transition
  // on stroke-dasharray for a coordinated reveal.
  const [displayProgress, setDisplayProgress] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame++;
      const tt = frame / totalFrames;
      const eased = 1 - Math.pow(1 - tt, 3);
      setDisplayProgress(Math.round(overallProgress * eased));
      if (frame >= totalFrames) {
        setDisplayProgress(overallProgress);
        clearInterval(interval);
      }
    }, 25);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [overallProgress]);

  // Pre-compute each segment's arc length and starting offset around the ring.
  let cumulative = 0;
  const arcs = segments.map((seg) => {
    const length = (seg.count / total) * circumference;
    const offset = cumulative;
    cumulative += length;
    return { ...seg, length, offset };
  });

  // Build the summary line, skipping zero-count buckets.
  const parts: string[] = [];
  if (done > 0) parts.push(`${done} done`);
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
            {/* Background track (also visually represents the "remaining" share) */}
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#242836" strokeWidth="8" />

            {/* One arc per status segment, butt-capped so they meet cleanly */}
            {arcs.map((arc) => {
              if (arc.count === 0) return null;
              const dashLen = mounted ? arc.length : 0;
              return (
                <circle
                  key={arc.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="8"
                  strokeLinecap="butt"
                  strokeDasharray={`${dashLen} ${circumference}`}
                  strokeDashoffset={-arc.offset}
                  style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              );
            })}
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
