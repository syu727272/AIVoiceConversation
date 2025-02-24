document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather icons
    feather.replace();

    const micButton = document.getElementById('micButton');
    const statusDiv = document.getElementById('status');
    const transcriptDiv = document.getElementById('transcript');
    const responseDiv = document.getElementById('response');
    const errorDiv = document.getElementById('error');

    let recognition = null;
    let synthesizer = window.speechSynthesis;
    let conversationHistory = [];

    // Initialize speech recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'ja-JP';  // Changed to Japanese
    } else {
        showError('Speech recognition is not supported in your browser.');
    }

    // Speech recognition event handlers
    recognition.onstart = () => {
        statusDiv.textContent = 'Listening...';
        micButton.classList.add('listening');
    };

    recognition.onend = () => {
        statusDiv.textContent = 'Click the microphone to start';
        micButton.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        showError(`Error occurred in recognition: ${event.error}`);
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptDiv.textContent = `Q: ${transcript}`;

        try {
            statusDiv.textContent = 'Processing...';

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: transcript,
                    history: conversationHistory
                })
            });

            const data = await response.json();

            if (data.success) {
                // Update conversation history
                conversationHistory.push(
                    { type: 'question', content: transcript },
                    { type: 'answer', content: data.response }
                );

                // Display response
                responseDiv.textContent = `A: ${data.response}`;

                // Speak response
                speakResponse(data.response);
            } else {
                showError(data.error || 'An error occurred');
            }
        } catch (error) {
            showError('Failed to get response from server');
        }
    };

    // Microphone button click handler
    micButton.addEventListener('click', () => {
        if (recognition) {
            try {
                recognition.start();
                hideError();
            } catch (error) {
                showError('Failed to start speech recognition');
            }
        }
    });

    // Speech synthesis function
    function speakResponse(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            statusDiv.textContent = 'Click the microphone to start';
        };
        synthesizer.speak(utterance);
    }

    // Error handling functions
    function showError(message) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('d-none');
    }

    function hideError() {
        errorDiv.classList.add('d-none');
    }
});