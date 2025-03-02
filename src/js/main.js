import { setupSpeechSynthesis } from './speechSynthesis.js';
import { setupFileUploaders } from './fileUploaders.js';
import { setupControls } from './controls.js';

document.addEventListener('DOMContentLoaded', () => {
    const { speak, pause, resume, stop } = setupSpeechSynthesis();
    setupFileUploaders();
    setupControls({ speak, pause, resume, stop });
});