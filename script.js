// Load flashcards from JSON
let flashcards = [];
let currentIndex = 0;
let isFlipped = false;
let autoPlayInterval = null;
let autoFlipEnabled = false;

// DOM Elements
const flashcard = document.getElementById('flashcard');
const wordEl = document.getElementById('word');
const pronunciationEl = document.getElementById('pronunciation');
const wordTypeEl = document.getElementById('word-type');
const meaningEl = document.getElementById('meaning');
const wordBackEl = document.getElementById('word-back');
const pronunciationBackEl = document.getElementById('pronunciation-back');
const currentCardEl = document.getElementById('current-card');
const totalCardsEl = document.getElementById('total-cards');
const progressPercentEl = document.getElementById('progress-percent');
const progressFillEl = document.getElementById('progress-fill');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const autoPlayBtn = document.getElementById('auto-play-btn');
const autoFlipToggle = document.getElementById('auto-flip-toggle');
const fileUpload = document.getElementById('file-upload');
const fileName = document.getElementById('file-name');
const speakerBtn = document.getElementById('speaker-btn');

// Load flashcards from uploaded file
function loadFromFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            flashcards = data;
            currentIndex = 0;
            totalCardsEl.textContent = flashcards.length;
            displayCard();
            updateProgress();
            fileName.textContent = file.name;
            
            // Show success message
            wordEl.textContent = 'File loaded successfully! ';
            pronunciationEl.textContent = `${flashcards.length} cards loaded`;
            setTimeout(() => {
                displayCard();
            }, 1000);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            wordEl.textContent = 'Error parsing file';
            pronunciationEl.textContent = 'Please check JSON format';
        }
    };
    
    reader.onerror = function() {
        wordEl.textContent = 'Error reading file';
        pronunciationEl.textContent = 'Please try again';
    };
    
    reader.readAsText(file);
}

// Load default JSON data
async function loadFlashcards() {
    try {
        const response = await fetch('unit5.json');
        flashcards = await response.json();
        totalCardsEl.textContent = flashcards.length;
        displayCard();
        updateProgress();
        fileName.textContent = 'unit5.json (default)';
    } catch (error) {
        console.error('Error loading flashcards:', error);
        wordEl.textContent = 'Click "Upload JSON File"';
        pronunciationEl.textContent = 'to get started';
    }
}

// Play pronunciation
function playPronunciation() {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentIndex];
    const word = card.word.toLowerCase().replace(/\s+/g, '-')?.split('-')[0];
    const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`;
    
    const audio = new Audio(audioUrl);
    
    audio.onerror = function() {
        // If US pronunciation fails, try UK
        const ukUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-uk.mp3`;
        const ukAudio = new Audio(ukUrl);
        ukAudio.onerror = function() {
            console.log('Pronunciation not available for:', card.word);
        };
        ukAudio.play().catch(err => console.log('Audio play failed:', err));
    };
    
    audio.play().catch(err => {
        console.log('Audio play failed:', err);
    });
}

// Display current card
function displayCard() {
    if (flashcards.length === 0) return;
    
    const card = flashcards[currentIndex];
    
    // Update front of card
    wordEl.textContent = card.word;
    pronunciationEl.textContent = card.pronunciation;
    wordTypeEl.textContent = card.type;
    
    // Update back of card
    meaningEl.textContent = card.meaning;
    wordBackEl.textContent = card.word;
    pronunciationBackEl.textContent = card.pronunciation;
    
    // Reset flip state
    if (isFlipped) {
        flipCard();
    }
    
    // Update navigation buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === flashcards.length - 1;
    
    // Update card counter
    currentCardEl.textContent = currentIndex + 1;
    
    updateProgress();
}

// Flip card
function flipCard() {
    flashcard.classList.toggle('flipped');
    isFlipped = !isFlipped;
}

// Navigate to previous card
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        displayCard();
    }
}

// Navigate to next card
function nextCard() {
    if (currentIndex < flashcards.length - 1) {
        currentIndex++;
        displayCard();
    }
}

// Shuffle cards
function shuffleCards() {
    for (let i = flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    currentIndex = 0;
    displayCard();
}

// Update progress
function updateProgress() {
    const progress = ((currentIndex + 1) / flashcards.length) * 100;
    progressPercentEl.textContent = Math.round(progress) + '%';
    progressFillEl.style.width = progress + '%';
}

// Auto play functionality
function toggleAutoPlay() {
    if (autoPlayInterval) {
        // Stop auto play
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayBtn.innerHTML = '<span class="btn-icon">▶️</span> Auto Play';
        autoPlayBtn.classList.remove('btn-primary');
        autoPlayBtn.classList.add('btn-small');
    } else {
        // Start auto play
        autoPlayInterval = setInterval(() => {
            if (autoFlipEnabled && !isFlipped) {
                // If auto flip is enabled and card is not flipped, flip it first
                flipCard();
            } else {
                // Move to next card or loop back to start
                if (currentIndex < flashcards.length - 1) {
                    nextCard();
                } else {
                    currentIndex = 0;
                    displayCard();
                }
            }
        }, autoFlipEnabled ? 2000 : 3000); // 2s with auto-flip, 3s without
        
        autoPlayBtn.innerHTML = '<span class="btn-icon">⏸️</span> Pause';
        autoPlayBtn.classList.remove('btn-small');
        autoPlayBtn.classList.add('btn-primary');
    }
}

// Auto flip toggle
function toggleAutoFlip() {
    autoFlipEnabled = autoFlipToggle.checked;
    
    // If auto play is running, restart it with new timing
    if (autoPlayInterval) {
        toggleAutoPlay(); // Stop
        toggleAutoPlay(); // Start with new timing
    }
}

// Keyboard navigation
function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowLeft':
            prevCard();
            break;
        case 'ArrowRight':
            nextCard();
            break;
        case ' ':
        case 'Enter':
            e.preventDefault();
            flipCard();
            break;
        case 's':
        case 'S':
            shuffleCards();
            break;
    }
}

// Event listeners
flashcard.addEventListener('click', flipCard);
prevBtn.addEventListener('click', prevCard);
nextBtn.addEventListener('click', nextCard);
shuffleBtn.addEventListener('click', shuffleCards);
autoPlayBtn.addEventListener('click', toggleAutoPlay);
autoFlipToggle.addEventListener('change', toggleAutoFlip);
document.addEventListener('keydown', handleKeyPress);

// Speaker button event listener
speakerBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent card flip when clicking speaker
    playPronunciation();
});

// File upload event listener
fileUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
        loadFromFile(file);
    } else {
        wordEl.textContent = 'Invalid file type';
        pronunciationEl.textContent = 'Please select a JSON file';
    }
});

// Initialize
loadFlashcards();

