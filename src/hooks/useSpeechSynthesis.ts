import { useState, useEffect, useCallback } from 'react';
import { Voice, AudioControls } from '../types';

export const useSpeechSynthesis = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    const updateVoices = () => {
      // Get the voices and ensure we have them
      const availableVoices = synth.getVoices();
      
      if (availableVoices.length > 0) {
        const voiceList = availableVoices.map((voice) => ({
          voice,
          name: voice.name,
          lang: voice.lang,
        }));
        setVoices(voiceList);
      }
    };

    // Initial load of voices
    updateVoices();

    // Chrome loads voices asynchronously
    synth.onvoiceschanged = updateVoices;

    // Cleanup
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, controls: AudioControls) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(text);
    
    // Set the voice if provided
    if (controls.voice) {
      newUtterance.voice = controls.voice;
    } else if (voices.length > 0) {
      // Default to the first available voice if none selected
      newUtterance.voice = voices[0].voice;
    }

    // Set other properties
    newUtterance.rate = controls.rate;
    newUtterance.volume = controls.volume;

    // Event handlers
    newUtterance.onstart = () => setSpeaking(true);
    newUtterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    newUtterance.onpause = () => setPaused(true);
    newUtterance.onresume = () => setPaused(false);
    newUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setSpeaking(false);
      setPaused(false);
    };

    window.speechSynthesis.speak(newUtterance);
    setUtterance(newUtterance);
  }, [voices]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  return {
    voices,
    speaking,
    paused,
    utterance,
    speak,
    pause,
    resume,
    stop,
  };
};