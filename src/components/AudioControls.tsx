import React, { useEffect } from 'react';
import { Volume2, FastForward, Rewind } from 'lucide-react';
import { Voice } from '../types';

interface AudioControlsProps {
  rate: number;
  volume: number;
  selectedVoice: SpeechSynthesisVoice | null;
  voices: Voice[];
  onRateChange: (rate: number) => void;
  onVolumeChange: (volume: number) => void;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  rate,
  volume,
  selectedVoice,
  voices,
  onRateChange,
  onVolumeChange,
  onVoiceChange,
}) => {
  // Set default voice when voices are loaded
  useEffect(() => {
    if (!selectedVoice && voices.length > 0) {
      onVoiceChange(voices[0].voice);
    }
  }, [voices, selectedVoice, onVoiceChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Rewind className="w-5 h-5" />
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => onRateChange(Number(e.target.value))}
          className="w-full"
        />
        <FastForward className="w-5 h-5" />
        <span className="text-sm">{rate}x</span>
      </div>

      <div className="flex items-center space-x-4">
        <Volume2 className="w-5 h-5" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-sm">{Math.round(volume * 100)}%</span>
      </div>

      <div className="flex items-center space-x-4">
        <select
          value={selectedVoice?.name || ""}
          onChange={(e) => {
            const selectedVoice = voices.find(v => v.name === e.target.value)?.voice;
            if (selectedVoice) {
              onVoiceChange(selectedVoice);
            }
          }}
          className="w-full p-2 border rounded-md bg-white"
        >
          {voices.length === 0 ? (
            <option value="">Loading voices...</option>
          ) : (
            voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
};