// Speech synthesis setup
const synth = window.speechSynthesis;
let currentUtterance = null;

// DOM elements
const textInput = document.getElementById('textInput');
const voiceSelect = document.getElementById('voiceSelect');
const rateControl = document.getElementById('rateControl');
const volumeControl = document.getElementById('volumeControl');
const rateValue = document.getElementById('rateValue');
const volumeValue = document.getElementById('volumeValue');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const stopButton = document.getElementById('stopButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const imageDropZone = document.getElementById('imageDropZone');
const imageInput = document.getElementById('imageInput');

// Voice loading
function loadVoices() {
    const voices = synth.getVoices();
    if (voices.length > 0) {
        voiceSelect.innerHTML = voices
            .map(voice => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`)
            .join('');
        
        const defaultVoice = voices.find(voice => voice.default) || voices[0];
        voiceSelect.value = defaultVoice.name;
    }
}

loadVoices();

if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Speech functions
function speak() {
    const text = textInput.value.trim();
    if (!text) return;

    if (synth.speaking) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
    
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }
    
    utterance.rate = parseFloat(rateControl.value);
    utterance.volume = parseFloat(volumeControl.value);

    utterance.onstart = () => {
        playButton.classList.add('hidden');
        pauseButton.classList.remove('hidden');
    };

    utterance.onend = () => {
        pauseButton.classList.add('hidden');
        playButton.classList.remove('hidden');
        currentUtterance = null;
    };

    synth.speak(utterance);
    currentUtterance = utterance;
}

function pause() {
    if (synth.speaking) {
        synth.pause();
        pauseButton.classList.add('hidden');
        playButton.classList.remove('hidden');
    }
}

function resume() {
    if (synth.paused) {
        synth.resume();
        playButton.classList.add('hidden');
        pauseButton.classList.remove('hidden');
    }
}

function stop() {
    synth.cancel();
    pauseButton.classList.add('hidden');
    playButton.classList.remove('hidden');
    currentUtterance = null;
}

// Convert audio buffer to MP3
function convertToMP3(audioBuffer) {
    const channels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
    const samples = new Int16Array(audioBuffer.length);
    
    // Get audio data from the first channel
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < channelData.length; i++) {
        samples[i] = channelData[i] * 0x7FFF;
    }
    
    const mp3Data = [];
    const blockSize = 1152;
    
    for (let i = 0; i < samples.length; i += blockSize) {
        const sampleChunk = samples.subarray(i, i + blockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }
    
    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }
    
    return new Blob(mp3Data, { type: 'audio/mp3' });
}

// MP3 download function
async function downloadMP3() {
    const text = textInput.value.trim();
    if (!text) {
        alert('Please enter some text first');
        return;
    }

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const mediaStreamDestination = audioContext.createMediaStreamDestination();
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
        const audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const arrayBuffer = await audioBlob.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            const mp3Blob = convertToMP3(audioBuffer);
            
            const url = URL.createObjectURL(mp3Blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'speech.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        };

        mediaRecorder.start();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
        utterance.rate = parseFloat(rateControl.value);
        utterance.volume = parseFloat(volumeControl.value);

        utterance.onend = () => {
            mediaRecorder.stop();
            audioContext.close();
        };

        synth.speak(utterance);

    } catch (error) {
        console.error('Error creating audio:', error);
        alert('Error creating audio file. Please try again.');
    }
}

// Image processing
async function processImage(file) {
    try {
        const result = await Tesseract.recognize(file, 'eng');
        textInput.value = result.data.text;
    } catch (error) {
        console.error('Error processing image:', error);
        alert('Error processing image. Please try again.');
    }
}

// File drop zone setup
function setupImageDropZone() {
    imageDropZone.addEventListener('click', () => imageInput.click());

    imageDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageDropZone.classList.add('border-blue-500');
    });

    imageDropZone.addEventListener('dragleave', () => {
        imageDropZone.classList.remove('border-blue-500');
    });

    imageDropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        imageDropZone.classList.remove('border-blue-500');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            await processImage(file);
        }
    });

    imageInput.addEventListener('change', async () => {
        if (imageInput.files[0]) {
            await processImage(imageInput.files[0]);
        }
    });
}

// Event listeners
playButton.addEventListener('click', () => {
    if (synth.paused) {
        resume();
    } else {
        speak();
    }
});

pauseButton.addEventListener('click', pause);
stopButton.addEventListener('click', stop);
clearButton.addEventListener('click', () => {
    textInput.value = '';
    stop();
});

downloadButton.addEventListener('click', async () => {
    downloadButton.disabled = true;
    try {
        await downloadMP3();
    } finally {
        downloadButton.disabled = false;
    }
});

rateControl.addEventListener('input', () => {
    rateValue.textContent = `${rateControl.value}x`;
});

volumeControl.addEventListener('input', () => {
    volumeValue.textContent = `${Math.round(volumeControl.value * 100)}%`;
});

// Initialize
setupImageDropZone();