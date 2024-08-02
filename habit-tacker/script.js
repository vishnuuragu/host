document.addEventListener('DOMContentLoaded', function() {
    const habitInput = document.getElementById('habit-input');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const habitList = document.getElementById('habit-list');

    // Load habits from local storage
    let habits = JSON.parse(localStorage.getItem('habits')) || [];

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
                <span>${habit.name}</span>
                <div>
                    <button class="remove-btn" data-index="${index}">Remove</button>
                </div>
            `;

            habitItem.addEventListener('click', () => {
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
    addHabitBtn.addEventListener('click', () => {
        const habitName = habitInput.value.trim();
        if (habitName) {
            habits.push({ name: habitName, completed: false });
            habitInput.value = '';
            saveHabits();
            renderHabits();
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
