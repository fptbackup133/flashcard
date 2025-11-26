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

// Test Mode Variables
let testMode = false;
let testQuestions = [];
let currentTestQuestion = 0;
let testScore = 0;
let selectedQuestionCount = 10;
let wrongAnswers = [];

// Test Mode DOM Elements
const studyModeBtn = document.getElementById('study-mode-btn');
const testModeBtn = document.getElementById('test-mode-btn');
const testModeContainer = document.getElementById('test-mode-container');
const testSetup = document.getElementById('test-setup');
const testQuestionsEl = document.getElementById('test-questions');
const testResultsEl = document.getElementById('test-results');
const startTestBtn = document.getElementById('start-test-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const reviewMistakesBtn = document.getElementById('review-mistakes-btn');
const retryMistakesBtn = document.getElementById('retry-mistakes-btn');
const newTestBtn = document.getElementById('new-test-btn');
const backToStudyBtn = document.getElementById('back-to-study-btn');
const speakerBtnTest = document.getElementById('speaker-btn-test');

// Study Mode Elements
const studyModeElements = document.querySelectorAll('.stats, .flashcard-container, .controls, .progress-bar, .mode-toggle');

// Mode Switch Functions
function switchToStudyMode() {
    testMode = false;
    studyModeBtn.classList.add('active');
    testModeBtn.classList.remove('active');
    testModeContainer.style.display = 'none';
    studyModeElements.forEach(el => el.style.display = 'flex');
    document.querySelector('.flashcard-container').style.display = 'block';
    document.querySelector('.progress-bar').style.display = 'block';
}

function switchToTestMode() {
    testMode = true;
    testModeBtn.classList.add('active');
    studyModeBtn.classList.remove('active');
    testModeContainer.style.display = 'block';
    studyModeElements.forEach(el => el.style.display = 'none');
    
    // Reset test setup
    testSetup.style.display = 'block';
    testQuestionsEl.style.display = 'none';
    testResultsEl.style.display = 'none';
    document.getElementById('review-section').style.display = 'none';
}

// Question Count Selection
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const value = this.getAttribute('data-questions');
        selectedQuestionCount = value === 'all' ? flashcards.length : parseInt(value);
    });
});

// Start Test
function startTest() {
    if (flashcards.length === 0) {
        alert('Please load flashcards first!');
        return;
    }
    
    // Reset test state
    testScore = 0;
    currentTestQuestion = 0;
    wrongAnswers = [];
    
    // Prepare questions
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const count = Math.min(selectedQuestionCount, flashcards.length);
    testQuestions = shuffled.slice(0, count);
    
    // Update UI
    document.getElementById('test-total').textContent = testQuestions.length;
    document.getElementById('test-score').textContent = '0';
    
    // Show test questions
    testSetup.style.display = 'none';
    testQuestionsEl.style.display = 'block';
    
    showQuestion();
}

// Show Current Question
function showQuestion() {
    if (currentTestQuestion >= testQuestions.length) {
        showResults();
        return;
    }
    
    const question = testQuestions[currentTestQuestion];
    
    // Update question display
    document.getElementById('question-word').textContent = question.word;
    document.getElementById('question-pronunciation').textContent = question.pronunciation;
    document.getElementById('test-current').textContent = currentTestQuestion + 1;
    
    // Update progress
    const progress = ((currentTestQuestion) / testQuestions.length) * 100;
    document.getElementById('test-progress-fill').style.width = progress + '%';
    
    // Generate answer options
    generateAnswerOptions(question);
    
    // Hide next button
    nextQuestionBtn.style.display = 'none';
}

// Generate Answer Options
function generateAnswerOptions(correctQuestion) {
    const answerOptionsContainer = document.getElementById('answer-options');
    answerOptionsContainer.innerHTML = '';
    
    // Get 3 random wrong answers
    const wrongOptions = flashcards
        .filter(card => card.meaning !== correctQuestion.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    // Combine with correct answer and shuffle
    const allOptions = [correctQuestion, ...wrongOptions].sort(() => Math.random() - 0.5);
    
    // Create answer buttons
    allOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = option.meaning;
        btn.onclick = () => checkAnswer(btn, option.meaning === correctQuestion.meaning, correctQuestion);
        answerOptionsContainer.appendChild(btn);
    });
}

// Check Answer
function checkAnswer(button, isCorrect, question) {
    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    if (isCorrect) {
        button.classList.add('correct');
        testScore++;
        document.getElementById('test-score').textContent = testScore;
    } else {
        button.classList.add('incorrect');
        // Show correct answer
        document.querySelectorAll('.answer-btn').forEach(btn => {
            if (btn.textContent === question.meaning) {
                btn.classList.add('correct');
            }
        });
        // Store wrong answer
        wrongAnswers.push({
            question: question,
            userAnswer: button.textContent
        });
    }
    
    // Show next button
    nextQuestionBtn.style.display = 'flex';
}

// Next Question
function nextQuestion() {
    currentTestQuestion++;
    showQuestion();
}

// Show Results
function showResults() {
    testQuestionsEl.style.display = 'none';
    testResultsEl.style.display = 'block';
    
    const totalQuestions = testQuestions.length;
    const percentage = Math.round((testScore / totalQuestions) * 100);
    
    // Update score display
    document.getElementById('correct-answers').textContent = testScore;
    document.getElementById('total-questions').textContent = totalQuestions;
    document.getElementById('score-percentage').textContent = percentage + '%';
    
    // Animate score circle
    const circumference = 2 * Math.PI * 90;
    const offset = circumference - (percentage / 100) * circumference;
    document.getElementById('score-circle').style.strokeDashoffset = offset;
    
    // Set grade
    const gradeEl = document.getElementById('score-grade');
    if (percentage >= 90) {
        gradeEl.textContent = 'Excellent!  🌟';
        gradeEl.style.color = '#4caf50';
    } else if (percentage >= 75) {
        gradeEl.textContent = 'Great Job! 👍';
        gradeEl.style.color = '#8bc34a';
    } else if (percentage >= 60) {
        gradeEl.textContent = 'Good Effort! 💪';
        gradeEl.style.color = '#ff9800';
    } else {
        gradeEl.textContent = 'Keep Practicing! 📚';
        gradeEl.style.color = '#f44336';
    }
    
    // Show/hide retry button based on wrong answers
    if (wrongAnswers.length > 0) {
        retryMistakesBtn.style.display = 'flex';
        reviewMistakesBtn.style.display = 'flex';
    } else {
        retryMistakesBtn.style.display = 'none';
        reviewMistakesBtn.style.display = 'none';
    }
}

// Review Mistakes
function reviewMistakes() {
    const reviewSection = document.getElementById('review-section');
    const reviewList = document.getElementById('review-list');
    
    reviewSection.style.display = 'block';
    reviewList.innerHTML = '';
    
    wrongAnswers.forEach((item, index) => {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div class="review-question">${index + 1}.${item.question.word}</div>
            <div class="review-details">
                <div><span class="review-detail-label">Pronunciation:</span>${item.question.pronunciation}</div>
                <div class="review-your-answer"><span class="review-detail-label">Your Answer:</span>${item.userAnswer}</div>
                <div class="review-correct-answer"><span class="review-detail-label">Correct Answer:</span>${item.question.meaning}</div>
            </div>
        `;
        reviewList.appendChild(reviewItem);
    });
    
    // Scroll to review section
    reviewSection.scrollIntoView({ behavior: 'smooth' });
}

// Retry Mistakes
function retryMistakes() {
    // Create test with only wrong answers
    testQuestions = wrongAnswers.map(item => item.question);
    selectedQuestionCount = testQuestions.length;
    
    // Reset test state
    testScore = 0;
    currentTestQuestion = 0;
    wrongAnswers = [];
    
    // Update UI
    document.getElementById('test-total').textContent = testQuestions.length;
    document.getElementById('test-score').textContent = '0';
    
    // Show test questions
    testResultsEl.style.display = 'none';
    testQuestionsEl.style.display = 'block';
    
    showQuestion();
}

// New Test
function newTest() {
    testResultsEl.style.display = 'none';
    testSetup.style.display = 'block';
}

// Play pronunciation in test mode
function playTestPronunciation() {
    if (testQuestions.length === 0 || currentTestQuestion >= testQuestions.length) return;
    
    const question = testQuestions[currentTestQuestion];
    const word = question.word.toLowerCase().replace(/\s+/g, '-').split('-')[0];
    const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-us.mp3`;
    
    const audio = new Audio(audioUrl);
    audio.onerror = function() {
        const ukUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word}-uk.mp3`;
        const ukAudio = new Audio(ukUrl);
        ukAudio.play().catch(err => console.log('Audio play failed:', err));
    };
    audio.play().catch(err => console.log('Audio play failed:', err));
}

// Event Listeners
studyModeBtn.addEventListener('click', switchToStudyMode);
testModeBtn.addEventListener('click', switchToTestMode);
startTestBtn.addEventListener('click', startTest);
nextQuestionBtn.addEventListener('click', nextQuestion);
reviewMistakesBtn.addEventListener('click', reviewMistakes);
retryMistakesBtn.addEventListener('click', retryMistakes);
newTestBtn.addEventListener('click', newTest);
backToStudyBtn.addEventListener('click', switchToStudyMode);
speakerBtnTest.addEventListener('click', playTestPronunciation);

// Initialize
studyModeBtn.classList.add('active');
loadFlashcards();
