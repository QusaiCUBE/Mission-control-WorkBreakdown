interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel?: string;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  ariaLabel = 'Progress',
}: SliderProps) {
  const clamped = Math.max(min, Math.min(max, value));
  const pct = ((clamped - min) / (max - min)) * 100;
  const bg = `linear-gradient(to right, #0984E3 0%, #0984E3 ${pct}%, #2D3348 ${pct}%, #2D3348 100%)`;

  return (
    <div className="flex items-center gap-3 w-full">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-2 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-4
          [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:w-4
          [&::-moz-range-thumb]:h-4
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:cursor-pointer"
        style={{ background: bg }}
      />
      <span className="text-xs text-gray-300 font-medium w-10 text-right tabular-nums">
        {clamped}%
      </span>
    </div>
  );
}
