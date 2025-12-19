/**
 * DurationSlider component
 * 
 * Reusable slider for adjusting time durations
 */

import React, { useState, useEffect, useRef } from 'react';
import './DurationSlider.css';

export interface DurationSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

export const DurationSlider: React.FC<DurationSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = 'min',
}) => {
  // Local state for immediate UI update
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setLocalValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce onChange callback (300ms)
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Calculate percentage for visual indicator
  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="duration-slider">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <span className="slider-value">
          {localValue} {unit}
        </span>
      </div>
      
      <div className="slider-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="slider-input"
          style={{
            background: `linear-gradient(to right, var(--color-focus) 0%, var(--color-focus) ${percentage}%, var(--color-border) ${percentage}%, var(--color-border) 100%)`,
          }}
        />
      </div>
      
      <div className="slider-range">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

