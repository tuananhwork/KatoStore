// client/src/components/QuantityInput.jsx
import React from 'react';

const IconMinus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const QuantityInput = ({ value, onChange, min = 1, max = Infinity, className = '' }) => (
  <div className={`flex items-center space-x-2 ${className}`}>
    <button
      onClick={() => onChange(Math.max(min, (value || 0) - 1))}
      disabled={(value || 0) <= min}
      className="w-8 h-8 rounded-full border border-[rgb(var(--color-border))] flex items-center justify-center hover:bg-[rgb(var(--color-bg-alt))] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <IconMinus />
    </button>
    <span className="w-12 text-center text-sm font-medium text-[rgb(var(--color-text))]">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, (value || 0) + 1))}
      disabled={(value || 0) >= max}
      className="w-8 h-8 rounded-full border border-[rgb(var(--color-border))] flex items-center justify-center hover:bg-[rgb(var(--color-bg-alt))] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <IconPlus />
    </button>
  </div>
);

export default QuantityInput;
