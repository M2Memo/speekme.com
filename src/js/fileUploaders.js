import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ') + '\n';
    }

    return text;
}

async function extractTextFromImage(file) {
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
}

export function setupFileUploaders() {
    const createUploader = (elementId, acceptedTypes, processFile) => {
        const uploader = document.getElementById(elementId);
        uploader.className = 'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors';
        
        uploader.innerHTML = `
            <div class="space-y-2">
                <input type="file" class="hidden" accept="${acceptedTypes}">
                <p class="text-sm text-gray-600">Drag & drop or click to upload</p>
            </div>
        `;

        const input = uploader.querySelector('input');

        uploader.addEventListener('click', () => input.click());
        uploader.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploader.classList.add('border-blue-500');
        });
        uploader.addEventListener('dragleave', () => {
            uploader.classList.remove('border-blue-500');
        });
        uploader.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploader.classList.remove('border-blue-500');
            
            const file = e.dataTransfer.files[0];
            if (file) {
                await handleFile(file);
            }
        });

        input.addEventListener('change', async () => {
            if (input.files[0]) {
                await handleFile(input.files[0]);
            }
        });

        async function handleFile(file) {
            try {
                const text = await processFile(file);
                document.getElementById('textInput').value = text;
            } catch (error) {
                console.error('Error processing file:', error);
                alert('Error processing file. Please try again.');
            }
        }
    };

    createUploader('pdfUploader', '.pdf', extractTextFromPDF);
    createUploader('imageUploader', 'image/*', extractTextFromImage);
}