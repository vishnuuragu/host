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
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');

    // Load habits from local storage
    let habits = loadJSON('habits', []);

    // Render habits
    function renderHabits() {
        habitList.innerHTML = '';
        habits.forEach((habit, index) => {
            const habitItem = document.createElement('li');
            habitItem.classList.add('habit-item');
            if (habit.completed) {
                habitItem.classList.add('completed');
            }

            habitItem.innerHTML = `
                <span>${escapeHTML(habit.name)}</span>
                <div>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            `;

            habitItem.addEventListener('click', (e) => {
                // Ignore clicks on the Remove button; those are handled separately
                if (e.target.classList.contains('remove-btn')) return;
                habit.completed = !habit.completed;
                saveHabits();
                renderHabits();
            });

            habitList.appendChild(habitItem);
        });
    }

    // Save habits to local storage
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    // Add new habit
    function addHabit() {
        const habitName = habitInput.value.trim();
        if (habitName) {
            habits.push({ name: habitName, completed: false });
            habitInput.value = '';
            saveHabits();
            renderHabits();
        }
    }

    // Add habit on button click
    addHabitBtn.addEventListener('click', addHabit);

    // Add habit on pressing Enter key
    habitInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addHabit();
        }
    });

    // Remove habit
    habitList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.dataset.index;
            habits.splice(index, 1);
            saveHabits();
            renderHabits();
        }
    });

    // Initial render
    renderHabits();
});
