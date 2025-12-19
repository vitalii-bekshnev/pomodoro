/**
 * Integration test for settings persistence
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { App } from '../../src/components/App';

describe('Settings Persistence Integration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should open settings panel when settings button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click settings button
    const settingsButton = screen.getByLabelText(/open settings/i);
    await user.click(settingsButton);

    // Settings panel should be visible
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Timer Durations')).toBeInTheDocument();
  });

  it('should close settings panel on cancel without saving changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open settings
    await user.click(screen.getByLabelText(/open settings/i));

    // Change focus duration
    const focusSlider = screen.getByLabelText(/focus duration/i);
    await user.clear(focusSlider);
    await user.type(focusSlider, '30');

    // Cancel
    await user.click(screen.getByText(/cancel/i));

    // Settings panel should be closed
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Re-open settings - value should still be default (25)
    await user.click(screen.getByLabelText(/open settings/i));
    const focusSliderAfter = screen.getByLabelText(/focus duration/i);
    expect(focusSliderAfter).toHaveValue('25');
  });

  it('should persist duration changes after save', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open settings
    await user.click(screen.getByLabelText(/open settings/i));

    // Change focus duration to 30 minutes
    const focusSlider = screen.getByLabelText(/focus duration/i);
    await user.clear(focusSlider);
    await user.type(focusSlider, '30');

    // Save changes
    await user.click(screen.getByText(/save changes/i));

    // Wait for settings to close
    await waitFor(() => {
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });

    // Timer should show 30:00
    expect(screen.getByText('30:00')).toBeInTheDocument();

    // Re-open settings - value should persist
    await user.click(screen.getByLabelText(/open settings/i));
    const focusSliderAfter = screen.getByLabelText(/focus duration/i);
    expect(focusSliderAfter).toHaveValue('30');
  });

  it('should persist settings across app remounts (localStorage)', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    // Open settings and change focus to 40 minutes
    await user.click(screen.getByLabelText(/open settings/i));
    const focusSlider = screen.getByLabelText(/focus duration/i);
    await user.clear(focusSlider);
    await user.type(focusSlider, '40');
    await user.click(screen.getByText(/save changes/i));

    // Unmount app
    unmount();

    // Re-mount app
    render(<App />);

    // Timer should show 40:00 (from localStorage)
    expect(screen.getByText('40:00')).toBeInTheDocument();
  });

  it('should toggle auto-start breaks setting', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open settings
    await user.click(screen.getByLabelText(/open settings/i));

    // Toggle auto-start breaks
    const autoStartBreaksToggle = screen.getByLabelText(/auto-start breaks/i);
    expect(autoStartBreaksToggle).not.toBeChecked();

    await user.click(autoStartBreaksToggle);
    expect(autoStartBreaksToggle).toBeChecked();

    // Save
    await user.click(screen.getByText(/save changes/i));

    // Re-open settings - should persist
    await user.click(screen.getByLabelText(/open settings/i));
    const autoStartBreaksToggleAfter = screen.getByLabelText(/auto-start breaks/i);
    expect(autoStartBreaksToggleAfter).toBeChecked();
  });

  it('should close settings panel on Escape key', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Open settings
    await user.click(screen.getByLabelText(/open settings/i));
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Press Escape
    await user.keyboard('{Escape}');

    // Settings should close
    await waitFor(() => {
      expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    });
  });

  it('should allow timer to continue running while modifying settings', async () => {
    const user = userEvent.setup();
    jest.useFakeTimers();
    render(<App />);

    // Start timer
    await user.click(screen.getByText(/start/i));

    // Wait 1 second
    jest.advanceTimersByTime(1000);

    // Open settings
    await user.click(screen.getByLabelText(/open settings/i));

    // Change short break duration
    const shortBreakSlider = screen.getByLabelText(/short break/i);
    await user.clear(shortBreakSlider);
    await user.type(shortBreakSlider, '10');

    // Save and close
    await user.click(screen.getByText(/save changes/i));

    // Timer should still be running (24:59)
    jest.advanceTimersByTime(0); // Flush pending timers
    expect(screen.getByText('24:59')).toBeInTheDocument();

    jest.useRealTimers();
  });
});

