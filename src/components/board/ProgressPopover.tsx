import { useEffect, useRef } from 'react';
import Slider from '../shared/Slider';

interface ProgressPopoverProps {
  value: number;
  x: number;
  y: number;
  onChange: (value: number) => void;
  onClose: () => void;
}

const W = 280;
const H = 96;
const MARGIN = 12;

export default function ProgressPopover({ value, x, y, onChange, onClose }: ProgressPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const id = window.setTimeout(() => {
      document.addEventListener('mousedown', onDocMouseDown);
    }, 0);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener('mousedown', onDocMouseDown);
    };
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = x - W / 2;
  let top = y + MARGIN;
  if (left + W + MARGIN > vw) left = vw - W - MARGIN;
  if (left < MARGIN) left = MARGIN;
  if (top + H + MARGIN > vh) top = y - H - MARGIN;
  if (top < MARGIN) top = MARGIN;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Set module progress"
      className="fixed z-50 w-[280px] bg-bg-secondary border border-border-primary rounded-lg shadow-xl p-3"
      style={{ left, top }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-300">Set progress</span>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-0.5 rounded text-gray-500 hover:text-gray-200 hover:bg-bg-tertiary transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <Slider value={value} onChange={onChange} ariaLabel="Module progress" />
    </div>
  );
}
