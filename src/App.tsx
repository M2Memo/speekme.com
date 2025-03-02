import React, { useState, useCallback } from 'react';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { AudioControls } from './components/AudioControls';
import { PlaybackControls } from './components/PlaybackControls';
import { FileUploader } from './components/FileUploader';
import { extractTextFromPDF, extractTextFromImage } from './utils/fileProcessing';
import { FileText, Image, Mic } from 'lucide-react';

function App() {
  const [text, setText] = useState('');
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const {
    voices,
    speaking,
    paused,
    speak,
    pause,
    resume,
    stop,
  } = useSpeechSynthesis();

  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const handlePlay = useCallback(() => {
    if (paused) {
      resume();
    } else {
      speak(text, { rate, volume, voice: selectedVoice });
    }
  }, [text, rate, volume, selectedVoice, paused, resume, speak]);

  const handleFileUpload = async (file: File) => {
    let extractedText = '';
    try {
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.startsWith('image/')) {
        extractedText = await extractTextFromImage(file);
      }
      setText(extractedText);
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Mic className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">Text to Speech Converter</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to speech..."
                className="w-full h-48 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">PDF Upload</span>
                </div>
                <FileUploader
                  onFileUpload={handleFileUpload}
                  accept={{
                    'application/pdf': ['.pdf'],
                  }}
                />

                <div className="flex items-center space-x-4">
                  <Image className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium">Image Upload</span>
                </div>
                <FileUploader
                  onFileUpload={handleFileUpload}
                  accept={{
                    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
                  }}
                />
              </div>
            </div>

            <div className="space-y-6">
              <AudioControls
                rate={rate}
                volume={volume}
                selectedVoice={selectedVoice}
                voices={voices}
                onRateChange={setRate}
                onVolumeChange={setVolume}
                onVoiceChange={setSelectedVoice}
              />

              <PlaybackControls
                speaking={speaking}
                paused={paused}
                onPlay={handlePlay}
                onPause={pause}
                onStop={stop}
                onClear={() => setText('')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;