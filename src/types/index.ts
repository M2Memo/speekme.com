export interface Voice {
  voice: SpeechSynthesisVoice;
  name: string;
  lang: string;
}

export interface AudioControls {
  rate: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
}