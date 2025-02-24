document.addEventListener('DOMContentLoaded', () => {
    // Initialize Feather icons
    feather.replace();

    const micButton = document.getElementById('micButton');
    const statusDiv = document.getElementById('status');
    const transcriptDiv = document.getElementById('transcript');
    const responseDiv = document.getElementById('response');
    const errorDiv = document.getElementById('error');
    const voiceSelect = document.getElementById('voiceSelect');

    let recognition = null;
    let synthesizer = window.speechSynthesis;
    let conversationHistory = [];
    let voices = [];

    // Initialize voice selection
    function populateVoiceList() {
        voices = synthesizer.getVoices().filter(voice => voice.lang.startsWith('ja')); // Filter Japanese voices
        voiceSelect.innerHTML = '<option value="">音声を選択してください</option>';

        voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    // Handle voice list changes
    if (synthesizer.onvoiceschanged !== undefined) {
        synthesizer.onvoiceschanged = populateVoiceList;
    }
    populateVoiceList();

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
        statusDiv.textContent = '聞いています...';
        micButton.classList.add('listening');
    };

    recognition.onend = () => {
        statusDiv.textContent = 'マイクをクリックして開始';
        micButton.classList.remove('listening');
    };

    recognition.onerror = (event) => {
        showError(`音声認識エラー: ${event.error}`);
    };

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        transcriptDiv.textContent = `Q: ${transcript}`;

        try {
            statusDiv.textContent = '処理中...';

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
                showError(data.error || 'エラーが発生しました');
            }
        } catch (error) {
            showError('サーバーからの応答に失敗しました');
        }
    };

    // Microphone button click handler
    micButton.addEventListener('click', () => {
        if (recognition) {
            try {
                recognition.start();
                hideError();
            } catch (error) {
                showError('音声認識の開始に失敗しました');
            }
        }
    });

    // Speech synthesis function
    function speakResponse(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';

        // Use selected voice if available
        const selectedVoiceIndex = voiceSelect.value;
        if (selectedVoiceIndex !== '' && voices[selectedVoiceIndex]) {
            utterance.voice = voices[selectedVoiceIndex];
        }

        utterance.onend = () => {
            statusDiv.textContent = 'マイクをクリックして開始';
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