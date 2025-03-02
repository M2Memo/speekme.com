import React from 'react';
import { Play, Pause, Square, RotateCcw, Trash2 } from 'lucide-react';

interface PlaybackControlsProps {
  speaking: boolean;
  paused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onClear: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  speaking,
  paused,
  onPlay,
  onPause,
  onStop,
  onClear,
}) => {
  return (
    <div className="flex justify-center space-x-4">
      {!speaking || paused ? (
        <button
          onClick={onPlay}
          className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
        >
          <Play className="w-6 h-6" />
        </button>
      ) : (
        <button
          onClick={onPause}
          className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          <Pause className="w-6 h-6" />
        </button>
      )}
      
      <button
        onClick={onStop}
        className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
      >
        <Square className="w-6 h-6" />
      </button>
      
      <button
        onClick={onClear}
        className="p-2 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
      >
        <Trash2 className="w-6 h-6" />
      </button>
    </div>
  );
};