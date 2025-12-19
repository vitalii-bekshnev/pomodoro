/**
 * ToggleSwitch component
 * 
 * Reusable toggle for boolean settings
 */

import React from 'react';
import './ToggleSwitch.css';

export interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  description,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="toggle-switch">
      <div className="toggle-content">
        <div className="toggle-text">
          <label className="toggle-label">{label}</label>
          {description && (
            <p className="toggle-description">{description}</p>
          )}
        </div>
        
        <label className="toggle-control">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className="toggle-input"
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
};

