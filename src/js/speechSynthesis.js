export function setupSpeechSynthesis() {
    const synth = window.speechSynthesis;
    let currentUtterance = null;

    const loadVoices = () => {
        const voices = synth.getVoices();
        const voiceSelect = document.getElementById('voiceSelect');
        voiceSelect.innerHTML = voices
            .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
            .join('');
    };

    synth.onvoiceschanged = loadVoices;
    loadVoices();

    const speak = (text, options = {}) => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voiceSelect = document.getElementById('voiceSelect');
        const voices = synth.getVoices();
        
        utterance.voice = voices.find(voice => voice.name === voiceSelect.value) || voices[0];
        utterance.rate = options.rate || 1;
        utterance.volume = options.volume || 1;

        utterance.onstart = () => {
            document.getElementById('playButton').classList.add('hidden');
            document.getElementById('pauseButton').classList.remove('hidden');
        };

        utterance.onend = () => {
            document.getElementById('pauseButton').classList.add('hidden');
            document.getElementById('playButton').classList.remove('hidden');
            currentUtterance = null;
        };

        synth.cancel();
        synth.speak(utterance);
        currentUtterance = utterance;
    };

    const pause = () => {
        synth.pause();
        document.getElementById('pauseButton').classList.add('hidden');
        document.getElementById('playButton').classList.remove('hidden');
    };

    const resume = () => {
        synth.resume();
        document.getElementById('playButton').classList.add('hidden');
        document.getElementById('pauseButton').classList.remove('hidden');
    };

    const stop = () => {
        synth.cancel();
        document.getElementById('pauseButton').classList.add('hidden');
        document.getElementById('playButton').classList.remove('hidden');
        currentUtterance = null;
    };

    return { speak, pause, resume, stop };
}