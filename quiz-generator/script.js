document.addEventListener('DOMContentLoaded', function() {
    // Mode switching elements
    const createModeBtn = document.getElementById('create-mode-btn');
    const takeModeBtn = document.getElementById('take-mode-btn');
    const createMode = document.getElementById('create-mode');
    const takeMode = document.getElementById('take-mode');

    // Create mode elements
    const quizTitle = document.getElementById('quiz-title');
    const quizDescription = document.getElementById('quiz-description');
    const questionInput = document.getElementById('question-input');
    const answer1 = document.getElementById('answer1');
    const answer2 = document.getElementById('answer2');
    const answer3 = document.getElementById('answer3');
    const answer4 = document.getElementById('answer4');
    const correctAnswerSelect = document.getElementById('correct-answer-select');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsList = document.getElementById('questions-list');
    const saveQuizBtn = document.getElementById('save-quiz-btn');

    // Take mode elements
    const quizSelect = document.getElementById('quiz-select');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizContainer = document.getElementById('quiz-container');
    const currentQuizTitle = document.getElementById('current-quiz-title');
    const questionCounter = document.getElementById('question-counter');
    const progressFill = document.getElementById('progress-fill');
    const currentQuestion = document.getElementById('current-question');
    const answersContainer = document.getElementById('answers-container');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const resultsContainer = document.getElementById('results-container');
    const scorePercentage = document.getElementById('score-percentage');
    const scoreText = document.getElementById('score-text');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');

    // Data
    let quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let currentQuestions = [];

    // Mode switching
    createModeBtn.addEventListener('click', () => switchMode('create'));
    takeModeBtn.addEventListener('click', () => switchMode('take'));

    function switchMode(mode) {
        if (mode === 'create') {
            createModeBtn.classList.add('active');
            takeModeBtn.classList.remove('active');
            createMode.style.display = 'block';
            takeMode.style.display = 'none';
        } else {
            takeModeBtn.classList.add('active');
            createModeBtn.classList.remove('active');
            takeMode.style.display = 'block';
            createMode.style.display = 'none';
            loadQuizList();
        }
    }

    // Create quiz functionality
    let questions = [];

    addQuestionBtn.addEventListener('click', addQuestion);

    function addQuestion() {
        const question = questionInput.value.trim();
        const answers = [
            answer1.value.trim(),
            answer2.value.trim(),
            answer3.value.trim(),
            answer4.value.trim()
        ];
        const correctAnswer = parseInt(correctAnswerSelect.value);

        if (question && answers.every(a => a)) {
            questions.push({
                question,
                answers,
                correctAnswer
            });

            // Clear inputs
            questionInput.value = '';
            answer1.value = '';
            answer2.value = '';
            answer3.value = '';
            answer4.value = '';

            renderQuestions();
            
            if (questions.length > 0) {
                saveQuizBtn.style.display = 'block';
            }
        }
    }

    function renderQuestions() {
        questionsList.innerHTML = '';
        questions.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-preview';
            questionDiv.innerHTML = `
                <h4>${index + 1}. ${q.question}</h4>
                <ul>
                    ${q.answers.map((answer, i) => 
                        `<li class="${i === q.correctAnswer ? 'correct' : ''}">${answer}</li>`
                    ).join('')}
                </ul>
                <button class="remove-question-btn" data-index="${index}">Remove</button>
            `;
            questionsList.appendChild(questionDiv);
        });
    }

    questionsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            const index = parseInt(e.target.dataset.index);
            questions.splice(index, 1);
            renderQuestions();
            if (questions.length === 0) {
                saveQuizBtn.style.display = 'none';
            }
        }
    });

    saveQuizBtn.addEventListener('click', () => {
        const title = quizTitle.value.trim();
        const description = quizDescription.value.trim();

        if (title && questions.length > 0) {
            const quiz = {
                id: Date.now(),
                title,
                description,
                questions: [...questions],
                created: new Date().toLocaleDateString()
            };

            quizzes.push(quiz);
            localStorage.setItem('quizzes', JSON.stringify(quizzes));

            // Reset form
            quizTitle.value = '';
            quizDescription.value = '';
            questions = [];
            renderQuestions();
            saveQuizBtn.style.display = 'none';

            alert('Quiz saved successfully!');
        }
    });

    // Take quiz functionality
    function loadQuizList() {
        quizSelect.innerHTML = '<option value="">Choose a quiz...</option>';
        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = `${quiz.title} (${quiz.questions.length} questions)`;
            quizSelect.appendChild(option);
        });
    }

    startQuizBtn.addEventListener('click', () => {
        const quizId = parseInt(quizSelect.value);
        if (quizId) {
            currentQuiz = quizzes.find(q => q.id === quizId);
            if (currentQuiz) {
                startQuiz();
            }
        }
    });

    function startQuiz() {
        currentQuestionIndex = 0;
        userAnswers = [];
        currentQuestions = [...currentQuiz.questions];

        document.querySelector('.quiz-selector').style.display = 'none';
        quizContainer.style.display = 'block';
        resultsContainer.style.display = 'none';

        currentQuizTitle.textContent = currentQuiz.title;
        showQuestion();
    }

    function showQuestion() {
        const question = currentQuestions[currentQuestionIndex];
        
        questionCounter.textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;
        progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;
        
        currentQuestion.textContent = question.question;
        
        answersContainer.innerHTML = '';
        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = answer;
            button.addEventListener('click', () => selectAnswer(index));
            answersContainer.appendChild(button);
        });

        nextQuestionBtn.style.display = 'none';
    }

    function selectAnswer(answerIndex) {
        userAnswers[currentQuestionIndex] = answerIndex;
        
        // Show correct/incorrect
        const buttons = answersContainer.querySelectorAll('.answer-btn');
        buttons.forEach((btn, index) => {
            btn.disabled = true;
            if (index === currentQuestions[currentQuestionIndex].correctAnswer) {
                btn.classList.add('correct');
            } else if (index === answerIndex && index !== currentQuestions[currentQuestionIndex].correctAnswer) {
                btn.classList.add('incorrect');
            }
        });

        nextQuestionBtn.style.display = 'block';
    }

    nextQuestionBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    });

    function showResults() {
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'block';

        const correctAnswers = userAnswers.filter((answer, index) => 
            answer === currentQuestions[index].correctAnswer
        ).length;

        const percentage = Math.round((correctAnswers / currentQuestions.length) * 100);
        
        scorePercentage.textContent = `${percentage}%`;
        scoreText.textContent = `You scored ${correctAnswers} out of ${currentQuestions.length}`;
    }

    restartQuizBtn.addEventListener('click', () => {
        document.querySelector('.quiz-selector').style.display = 'block';
        quizContainer.style.display = 'none';
        resultsContainer.style.display = 'none';
        loadQuizList();
    });

    // Initialize
    loadQuizList();
});