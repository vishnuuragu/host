// Read a JSON value from localStorage, falling back if missing or corrupted
function loadJSON(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch (e) {
        return fallback;
    }
}

// Escape user-provided text before inserting it into innerHTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, ch => (
        { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
}

document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const workoutName = document.getElementById('workout-name');
    const workoutType = document.getElementById('workout-type');
    const difficultyLevel = document.getElementById('difficulty-level');
    const exercisesList = document.getElementById('exercises-list');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const saveWorkoutBtn = document.getElementById('save-workout-btn');
    const clearWorkoutBtn = document.getElementById('clear-workout-btn');
    
    // Workout library
    const savedWorkouts = document.getElementById('saved-workouts');
    
    // Progress elements
    const workoutSelect = document.getElementById('workout-select');
    const startWorkoutBtn = document.getElementById('start-workout-btn');
    const activeWorkout = document.getElementById('active-workout');
    const currentWorkoutName = document.getElementById('current-workout-name');
    const timerDisplay = document.getElementById('timer-display');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const stopWorkoutBtn = document.getElementById('stop-workout-btn');
    const currentExerciseName = document.getElementById('current-exercise-name');
    const exerciseCounter = document.getElementById('exercise-counter');
    const exerciseProgressFill = document.getElementById('exercise-progress-fill');
    const currentExerciseDetails = document.getElementById('current-exercise-details');
    const nextExerciseBtn = document.getElementById('next-exercise-btn');
    const workoutComplete = document.getElementById('workout-complete');
    const finalDuration = document.getElementById('final-duration');
    const exercisesCompleted = document.getElementById('exercises-completed');
    const finishWorkoutBtn = document.getElementById('finish-workout-btn');
    const historyList = document.getElementById('history-list');

    // Data storage
    let workoutPlans = loadJSON('workoutPlans', []);
    let workoutHistory = loadJSON('workoutHistory', []);
    let exercises = [];
    
    // Workout session data
    let currentWorkout = null;
    let currentExerciseIndex = 0;
    let workoutTimer = null;
    let workoutStartTime = null;
    let isPaused = false;
    let totalSeconds = 0;

    // Predefined exercises by type
    const exerciseTemplates = {
        strength: [
            { name: 'Push-ups', defaultSets: 3, defaultReps: 10, type: 'reps' },
            { name: 'Squats', defaultSets: 3, defaultReps: 15, type: 'reps' },
            { name: 'Deadlifts', defaultSets: 3, defaultReps: 8, type: 'reps' },
            { name: 'Bench Press', defaultSets: 3, defaultReps: 10, type: 'reps' },
            { name: 'Pull-ups', defaultSets: 3, defaultReps: 5, type: 'reps' }
        ],
        cardio: [
            { name: 'Running', defaultSets: 1, defaultDuration: 20, type: 'time' },
            { name: 'Cycling', defaultSets: 1, defaultDuration: 30, type: 'time' },
            { name: 'Jumping Jacks', defaultSets: 3, defaultDuration: 1, type: 'time' },
            { name: 'Burpees', defaultSets: 3, defaultReps: 10, type: 'reps' },
            { name: 'Mountain Climbers', defaultSets: 3, defaultDuration: 1, type: 'time' }
        ],
        flexibility: [
            { name: 'Hamstring Stretch', defaultSets: 2, defaultDuration: 0.5, type: 'time' },
            { name: 'Shoulder Stretch', defaultSets: 2, defaultDuration: 0.5, type: 'time' },
            { name: 'Quad Stretch', defaultSets: 2, defaultDuration: 0.5, type: 'time' },
            { name: 'Cat-Cow Pose', defaultSets: 1, defaultReps: 10, type: 'reps' },
            { name: 'Child\'s Pose', defaultSets: 1, defaultDuration: 2, type: 'time' }
        ]
    };

    // Add exercise functionality
    addExerciseBtn.addEventListener('click', () => {
        const exerciseDiv = document.createElement('div');
        exerciseDiv.className = 'exercise-item';
        
        const currentType = workoutType.value;
        const templates = exerciseTemplates[currentType] || exerciseTemplates.strength;
        
        exerciseDiv.innerHTML = `
            <div class="exercise-form">
                <select class="exercise-name">
                    <option value="">Select Exercise</option>
                    ${templates.map(ex => `<option value="${ex.name}" data-type="${ex.type}" data-sets="${ex.defaultSets}" data-reps="${ex.defaultReps || ''}" data-duration="${ex.defaultDuration || ''}">${ex.name}</option>`).join('')}
                    <option value="custom">Custom Exercise</option>
                </select>
                <input type="text" class="custom-exercise" placeholder="Custom exercise name" style="display: none;" />
                <input type="number" class="sets" placeholder="Sets" min="1" />
                <input type="number" class="reps" placeholder="Reps" min="1" />
                <input type="number" class="duration" placeholder="Duration (min)" min="0.5" step="0.5" />
                <button class="remove-exercise">Remove</button>
            </div>
        `;
        
        exercisesList.appendChild(exerciseDiv);
        
        // Add event listeners
        const selectElement = exerciseDiv.querySelector('.exercise-name');
        const customInput = exerciseDiv.querySelector('.custom-exercise');
        const setsInput = exerciseDiv.querySelector('.sets');
        const repsInput = exerciseDiv.querySelector('.reps');
        const durationInput = exerciseDiv.querySelector('.duration');
        
        selectElement.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInput.style.display = 'block';
                customInput.required = true;
            } else {
                customInput.style.display = 'none';
                customInput.required = false;
                
                // Fill in defaults
                const option = e.target.selectedOptions[0];
                if (option) {
                    setsInput.value = option.dataset.sets || '';
                    repsInput.value = option.dataset.reps || '';
                    durationInput.value = option.dataset.duration || '';
                    
                    // Show/hide relevant fields
                    if (option.dataset.type === 'time') {
                        repsInput.style.display = 'none';
                        durationInput.style.display = 'block';
                    } else {
                        repsInput.style.display = 'block';
                        durationInput.style.display = 'none';
                    }
                }
            }
        });
        
        exerciseDiv.querySelector('.remove-exercise').addEventListener('click', () => {
            exerciseDiv.remove();
        });
    });

    // Save workout plan
    saveWorkoutBtn.addEventListener('click', () => {
        const name = workoutName.value.trim();
        if (!name) {
            alert('Please enter a workout name');
            return;
        }

        exercises = Array.from(exercisesList.querySelectorAll('.exercise-item')).map(item => {
            const selectElement = item.querySelector('.exercise-name');
            const customInput = item.querySelector('.custom-exercise');
            const exerciseName = selectElement.value === 'custom' ? customInput.value : selectElement.value;
            
            return {
                name: exerciseName,
                sets: parseInt(item.querySelector('.sets').value) || 1,
                reps: parseInt(item.querySelector('.reps').value) || null,
                duration: parseFloat(item.querySelector('.duration').value) || null
            };
        }).filter(ex => ex.name);

        if (exercises.length === 0) {
            alert('Please add at least one exercise');
            return;
        }

        const workout = {
            id: Date.now(),
            name,
            type: workoutType.value,
            difficulty: difficultyLevel.value,
            exercises,
            created: new Date().toLocaleDateString()
        };

        workoutPlans.push(workout);
        localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
        
        // Clear form
        workoutName.value = '';
        exercisesList.innerHTML = '';
        exercises = [];
        
        renderWorkoutLibrary();
        updateWorkoutSelect();
        
        // Show feedback
        const originalText = saveWorkoutBtn.textContent;
        saveWorkoutBtn.textContent = 'Saved!';
        saveWorkoutBtn.style.backgroundColor = '#27ae60';
        setTimeout(() => {
            saveWorkoutBtn.textContent = originalText;
            saveWorkoutBtn.style.backgroundColor = '#4A90E2';
        }, 2000);
    });

    // Clear workout form
    clearWorkoutBtn.addEventListener('click', () => {
        if (confirm('Clear all exercises?')) {
            exercisesList.innerHTML = '';
            exercises = [];
        }
    });

    // Render workout library
    function renderWorkoutLibrary() {
        if (workoutPlans.length === 0) {
            savedWorkouts.innerHTML = '<p class="no-workouts">No workout plans saved yet.</p>';
            return;
        }

        savedWorkouts.innerHTML = '';
        workoutPlans.forEach(workout => {
            const workoutCard = document.createElement('div');
            workoutCard.className = 'workout-card';
            
            workoutCard.innerHTML = `
                <div class="workout-info">
                    <h4>${escapeHTML(workout.name)}</h4>
                    <div class="workout-meta">
                        <span class="type">${workout.type}</span>
                        <span class="difficulty">${workout.difficulty}</span>
                        <span class="exercises-count">${workout.exercises.length} exercises</span>
                    </div>
                    <div class="workout-date">Created: ${workout.created}</div>
                </div>
                <div class="workout-actions">
                    <button class="view-workout-btn" data-id="${workout.id}">View</button>
                    <button class="delete-workout-btn" data-id="${workout.id}">Delete</button>
                </div>
            `;
            
            savedWorkouts.appendChild(workoutCard);
        });

        // Add event listeners
        savedWorkouts.querySelectorAll('.view-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workoutId = parseInt(e.target.dataset.id);
                const workout = workoutPlans.find(w => w.id === workoutId);
                showWorkoutDetails(workout);
            });
        });

        savedWorkouts.querySelectorAll('.delete-workout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workoutId = parseInt(e.target.dataset.id);
                if (confirm('Delete this workout plan?')) {
                    workoutPlans = workoutPlans.filter(w => w.id !== workoutId);
                    localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
                    renderWorkoutLibrary();
                    updateWorkoutSelect();
                }
            });
        });
    }

    function showWorkoutDetails(workout) {
        alert(`${workout.name}\n\nExercises:\n${workout.exercises.map(ex => 
            `• ${ex.name}: ${ex.sets} sets${ex.reps ? ` x ${ex.reps} reps` : ''}${ex.duration ? ` x ${ex.duration} min` : ''}`
        ).join('\n')}`);
    }

    // Update workout select dropdown
    function updateWorkoutSelect() {
        workoutSelect.innerHTML = '<option value="">Select a workout plan...</option>';
        workoutPlans.forEach(workout => {
            const option = document.createElement('option');
            option.value = workout.id;
            option.textContent = workout.name;
            workoutSelect.appendChild(option);
        });
    }

    // Start workout
    startWorkoutBtn.addEventListener('click', () => {
        const workoutId = parseInt(workoutSelect.value);
        if (!workoutId) {
            alert('Please select a workout plan');
            return;
        }

        currentWorkout = workoutPlans.find(w => w.id === workoutId);
        currentExerciseIndex = 0;
        totalSeconds = 0;
        
        activeWorkout.style.display = 'block';
        currentWorkoutName.textContent = currentWorkout.name;
        
        startTimer();
        showCurrentExercise();
    });

    function startTimer() {
        workoutStartTime = Date.now() - (totalSeconds * 1000);
        workoutTimer = setInterval(() => {
            if (!isPaused) {
                totalSeconds = Math.floor((Date.now() - workoutStartTime) / 1000);
                updateTimerDisplay();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function showCurrentExercise() {
        const exercise = currentWorkout.exercises[currentExerciseIndex];
        currentExerciseName.textContent = exercise.name;
        exerciseCounter.textContent = `${currentExerciseIndex + 1} / ${currentWorkout.exercises.length}`;
        exerciseProgressFill.style.width = `${((currentExerciseIndex + 1) / currentWorkout.exercises.length) * 100}%`;
        
        currentExerciseDetails.innerHTML = `
            <p><strong>Sets:</strong> ${exercise.sets}</p>
            ${exercise.reps ? `<p><strong>Reps:</strong> ${exercise.reps}</p>` : ''}
            ${exercise.duration ? `<p><strong>Duration:</strong> ${exercise.duration} minutes</p>` : ''}
        `;
    }

    // Exercise control buttons
    nextExerciseBtn.addEventListener('click', () => {
        currentExerciseIndex++;
        if (currentExerciseIndex >= currentWorkout.exercises.length) {
            completeWorkout();
        } else {
            showCurrentExercise();
        }
    });

    pauseResumeBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseResumeBtn.textContent = isPaused ? 'Resume' : 'Pause';
        if (!isPaused) {
            workoutStartTime = Date.now() - (totalSeconds * 1000);
        }
    });

    stopWorkoutBtn.addEventListener('click', () => {
        if (confirm('Stop workout? Progress will be lost.')) {
            stopWorkout();
        }
    });

    function completeWorkout() {
        clearInterval(workoutTimer);
        activeWorkout.style.display = 'none';
        workoutComplete.style.display = 'block';
        
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        finalDuration.textContent = `${minutes}m ${seconds}s`;
        exercisesCompleted.textContent = currentWorkout.exercises.length;
    }

    function stopWorkout() {
        clearInterval(workoutTimer);
        activeWorkout.style.display = 'none';
        workoutComplete.style.display = 'none';
        currentWorkout = null;
        isPaused = false;
        pauseResumeBtn.textContent = 'Pause';
    }

    finishWorkoutBtn.addEventListener('click', () => {
        // Save workout to history
        const historyEntry = {
            id: Date.now(),
            workoutName: currentWorkout.name,
            duration: totalSeconds,
            exercisesCompleted: currentWorkout.exercises.length,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };

        workoutHistory.unshift(historyEntry);
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        
        renderWorkoutHistory();
        stopWorkout();
        
        alert('Workout completed and saved to history!');
    });

    function renderWorkoutHistory() {
        if (workoutHistory.length === 0) {
            historyList.innerHTML = '<p class="no-history">No workout history yet.</p>';
            return;
        }

        historyList.innerHTML = '';
        workoutHistory.slice(0, 10).forEach(entry => { // Show last 10 workouts
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const minutes = Math.floor(entry.duration / 60);
            const seconds = entry.duration % 60;
            
            historyItem.innerHTML = `
                <div class="history-info">
                    <h4>${escapeHTML(entry.workoutName)}</h4>
                    <div class="history-details">
                        <span>Duration: ${minutes}m ${seconds}s</span>
                        <span>Exercises: ${entry.exercisesCompleted}</span>
                        <span>${entry.date} at ${entry.time}</span>
                    </div>
                </div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    // Initialize
    renderWorkoutLibrary();
    updateWorkoutSelect();
    renderWorkoutHistory();
});