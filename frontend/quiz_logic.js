document.addEventListener('DOMContentLoaded', () => {
    // Navigation Elements
    const createTrigger = document.getElementById('create-quiz-trigger');
    const flowBack = document.getElementById('quiz-flow-back');
    const arenaHome = document.getElementById('quiz-arena-home');
    const createFlow = document.getElementById('quiz-create-flow');
    
    // Step Containers
    const step1 = document.getElementById('quiz-step-config');
    const step2 = document.getElementById('quiz-step-source');
    const readyView = document.getElementById('quiz-ready-view');
    const playView = document.getElementById('quiz-play-view');
    
    // Inputs & Buttons
    const gotoStep2 = document.getElementById('goto-step-2');
    const generateBtn = document.getElementById('generate-quiz');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const readyMeta = document.getElementById('quiz-ready-meta');
    const topicInput = document.getElementById('quiz-topic-input');
    const fileInput = document.getElementById('quiz-file-input');
    const uploadTrigger = document.getElementById('quiz-upload-trigger');
    const uploadStatus = document.getElementById('upload-status');
    
    // Quiz Play Elements
    const currentQNum = document.getElementById('current-q-num');
    const totalQNum = document.getElementById('total-q-num');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const quizFeedback = document.getElementById('quiz-feedback');
    const explanationText = document.getElementById('explanation-text');
    const nextBtn = document.getElementById('next-question');
    const progressBar = document.getElementById('quiz-progress-bar');
    const progressPercent = document.getElementById('quiz-progress-percent');

    // State
    let selectedTime = '10 Min';
    let selectedCount = 10;
    let selectedDifficulty = 'Medium';
    let currentQuestions = [];
    let currentStepIndex = 0;
    let selectedFile = null;
    let quizXP = 0;
    let correctCount = 0;

    // --- Navigation Logic ---
    createTrigger.addEventListener('click', () => {
        arenaHome.classList.add('hidden');
        createFlow.classList.remove('hidden');
        showStep('config');
    });

    flowBack.addEventListener('click', () => {
        createFlow.classList.add('hidden');
        arenaHome.classList.remove('hidden');
    });

    function showStep(stepName) {
        step1.classList.add('hidden');
        step2.classList.add('hidden');
        readyView.classList.add('hidden');
        playView.classList.add('hidden');

        if (stepName === 'config') step1.classList.remove('hidden');
        if (stepName === 'source') step2.classList.remove('hidden');
        if (stepName === 'ready') step2.classList.add('hidden'), readyView.classList.remove('hidden');
        if (stepName === 'play') {
            createFlow.classList.remove('hidden');
            playView.classList.remove('hidden');
        }
    }

    gotoStep2.addEventListener('click', () => showStep('source'));

    // --- Configuration Logic ---
    const timeOpts = document.querySelectorAll('.time-opt');
    const qOpts = document.querySelectorAll('.q-opt');

    timeOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            timeOpts.forEach(o => o.classList.replace('bg-primary', 'bg-surface-container-low'));
            opt.classList.replace('bg-surface-container-low', 'bg-primary');
            selectedTime = opt.innerText;
        });
    });

    qOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            qOpts.forEach(o => o.classList.replace('bg-emerald-600', 'bg-slate-50'));
            opt.classList.replace('bg-slate-50', 'bg-emerald-600');
            opt.classList.add('text-white');
            selectedCount = parseInt(opt.innerText);
        });
    });

    const diffOpts = document.querySelectorAll('.diff-opt');
    diffOpts.forEach(opt => {
        opt.addEventListener('click', () => {
            diffOpts.forEach(o => {
                o.classList.remove('bg-amber-500', 'text-white', 'shadow-md', 'shadow-amber-500/20');
                o.classList.add('bg-slate-50', 'text-slate-500');
            });
            opt.classList.remove('bg-slate-50', 'text-slate-500');
            opt.classList.add('bg-amber-500', 'text-white', 'shadow-md', 'shadow-amber-500/20');
            selectedDifficulty = opt.innerText;
        });
    });

    // --- Upload Handling ---
    uploadTrigger.addEventListener('click', (e) => {
        if (e.target.id !== 'quiz-file-input') fileInput.click();
    });

    // --- Visibility Toggle Logic ---
    function checkInputs() {
        const hasTopic = topicInput.value.trim().length > 0;
        const hasFile = selectedFile !== null;
        
        if (hasTopic || hasFile) {
            generateBtn.classList.remove('hidden');
        } else {
            generateBtn.classList.add('hidden');
        }
    }

    topicInput.addEventListener('input', checkInputs);

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            uploadStatus.innerText = `Selected: ${selectedFile.name}`;
            uploadStatus.classList.replace('text-outline', 'text-secondary');
            checkInputs();
        }
    });

    // --- Generation Logic ---
    generateBtn.addEventListener('click', async () => {
        const topic = topicInput.value.trim();
        if (!topic && !selectedFile) {
            alert('Please enter a topic or upload a file.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerText = 'Analyzing & Generating...';

        const formData = new FormData();
        formData.append('topic', topic);
        formData.append('numQuestions', selectedCount);
        formData.append('timeLimit', selectedTime);
        formData.append('difficulty', selectedDifficulty);
        if (selectedFile) formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/generate-quiz', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                currentQuestions = data.quiz;
                readyMeta.innerText = `${currentQuestions.length} Questions • ${selectedDifficulty} Difficulty • ${selectedTime}`;
                showStep('ready');
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            alert('Generation failed: ' + err.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerText = 'Generate Quiz';
        }
    });

    // --- Quiz Play Logic ---
    startQuizBtn.addEventListener('click', () => {
        startQuiz();
    });

    function startQuiz() {
        currentStepIndex = 0;
        quizXP = 0;
        correctCount = 0;
        showStep('play');
        totalQNum.innerText = currentQuestions.length;
        renderQuestion();
    }

    function renderQuestion() {
        const q = currentQuestions[currentStepIndex];
        currentQNum.innerText = currentStepIndex + 1;
        questionText.innerText = q.question;
        
        // Progress
        const percent = Math.round((currentStepIndex / currentQuestions.length) * 100);
        progressBar.style.width = `${percent}%`;
        progressPercent.innerText = `${percent}% Complete`;

        optionsContainer.innerHTML = '';
        quizFeedback.classList.add('hidden');
        nextBtn.classList.add('hidden');

        q.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = "w-full group flex items-center p-5 rounded-2xl bg-surface-container-low hover:bg-surface-bright transition-all duration-300 text-left border border-transparent hover:border-primary/20";
            btn.innerHTML = `
                <div class="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center font-headline font-bold text-primary mr-4 group-hover:scale-110 transition-transform">${String.fromCharCode(65 + idx)}</div>
                <span class="flex-1 font-body font-medium text-on-surface">${opt}</span>
            `;
            btn.onclick = () => handleAnswer(idx, btn);
            optionsContainer.appendChild(btn);
        });
    }

    function handleAnswer(idx, btn) {
        const q = currentQuestions[currentStepIndex];
        const allBtns = optionsContainer.querySelectorAll('button');
        allBtns.forEach(b => b.disabled = true);

        const feedbackTitle = document.getElementById('feedback-title');

        if (idx === q.correctIndex) {
            btn.classList.replace('bg-surface-container-low', 'bg-secondary-container');
            btn.classList.add('text-on-secondary-container', 'border-secondary/20');
            quizXP += 50;
            correctCount++;
            // Save XP immediately to localStorage and update sidebar
            const storedXP = parseInt(localStorage.getItem('studybuddy_xp') || '0');
            localStorage.setItem('studybuddy_xp', storedXP + 50);
            if (window.updateSidebarXP) window.updateSidebarXP();
            feedbackTitle.innerHTML = `That's Correct! <span class="ml-3 inline-flex items-center gap-1 bg-amber-400/20 text-amber-600 text-sm font-bold px-3 py-1 rounded-full animate-bounce">⚡ +50 XP</span>`;
        } else {
            btn.classList.replace('bg-surface-container-low', 'bg-error-container');
            btn.classList.add('border-error/20');
            // Highlight correct one
            allBtns[q.correctIndex].classList.replace('bg-surface-container-low', 'bg-secondary-container');
            feedbackTitle.innerHTML = `Incorrect <span class="ml-3 inline-flex items-center gap-1 text-slate-400 text-sm font-bold px-3 py-1 rounded-full">+0 XP</span>`;
        }

        explanationText.innerText = q.explanation;
        quizFeedback.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    }

    nextBtn.addEventListener('click', () => {
        currentStepIndex++;
        if (currentStepIndex < currentQuestions.length) {
            renderQuestion();
        } else {
            // Quiz completed — show XP summary
            playView.querySelector('section') ? null : null; // safety
            const totalQ = currentQuestions.length;
            const scorePercent = Math.round((correctCount / totalQ) * 100);

            // Show completion overlay
            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm';
            overlay.innerHTML = `
                <div class="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl">
                    <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                        <span class="material-symbols-outlined text-4xl" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                    </div>
                    <h2 class="font-headline text-3xl font-bold text-on-surface mb-2">Quiz Complete!</h2>
                    <p class="text-on-surface-variant mb-6">You scored ${correctCount}/${totalQ} (${scorePercent}%)</p>
                    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                        <p class="text-amber-600 font-headline text-4xl font-bold">⚡ ${quizXP} XP</p>
                        <p class="text-amber-500 text-sm mt-1">${correctCount} correct × 50 XP each</p>
                    </div>
                    <button onclick="location.reload()" class="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-xl font-headline font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all">
                        Back to Quiz Arena
                    </button>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    });
});
