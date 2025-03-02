export function setupControls({ speak, pause, resume, stop }) {
    const textInput = document.getElementById('textInput');
    const rateControl = document.getElementById('rateControl');
    const volumeControl = document.getElementById('volumeControl');
    const rateValue = document.getElementById('rateValue');
    const volumeValue = document.getElementById('volumeValue');
    const playButton = document.getElementById('playButton');
    const pauseButton = document.getElementById('pauseButton');
    const stopButton = document.getElementById('stopButton');
    const clearButton = document.getElementById('clearButton');

    rateControl.addEventListener('input', () => {
        rateValue.textContent = `${rateControl.value}x`;
    });

    volumeControl.addEventListener('input', () => {
        volumeValue.textContent = `${Math.round(volumeControl.value * 100)}%`;
    });

    playButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            if (window.speechSynthesis.paused) {
                resume();
            } else {
                speak(text, {
                    rate: parseFloat(rateControl.value),
                    volume: parseFloat(volumeControl.value)
                });
            }
        }
    });

    pauseButton.addEventListener('click', pause);
    stopButton.addEventListener('click', stop);
    clearButton.addEventListener('click', () => {
        textInput.value = '';
        stop();
    });
}