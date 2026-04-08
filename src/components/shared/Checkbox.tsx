interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

export default function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      onClick={onChange}
      className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
        checked
          ? 'bg-status-done scale-100'
          : 'border-2 border-gray-500 hover:border-gray-400 scale-100'
      }`}
      style={checked ? { animation: 'checkBounce 0.3s ease-out' } : undefined}
    >
      {checked && (
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3">
          <path
            d="M2 6l3 3 5-6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-check"
          />
        </svg>
      )}
      <style>{`
        @keyframes checkBounce {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes drawCheck {
          from { stroke-dashoffset: 20; }
          to { stroke-dashoffset: 0; }
        }
        .animate-draw-check {
          stroke-dasharray: 20;
          animation: drawCheck 0.3s ease-out forwards;
        }
      `}</style>
    </button>
  );
}
