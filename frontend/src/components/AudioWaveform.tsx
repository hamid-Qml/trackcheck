import React from 'react';

interface AudioWaveformProps {
  className?: string;
  animated?: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ className = "", animated = true }) => {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const height = Math.random() * 80 + 20;
    const delay = Math.random() * 2;
    return { height, delay };
  });

  return (
    <div className={`flex items-end gap-1 justify-center ${className}`}>
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`bg-gradient-to-t from-primary via-secondary to-accent rounded-sm ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{
            width: '4px',
            height: `${bar.height}px`,
            animationDelay: `${bar.delay}s`,
            animationDuration: '1.5s',
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;