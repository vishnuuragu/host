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
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Load tasks from local storage
    let tasks = loadJSON('tasks', []);
    let currentFilter = 'all';

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'completed') return task.completed;
            if (currentFilter === 'pending') return !task.completed;
            return true;
        });

        filteredTasks.forEach((task, index) => {
            const originalIndex = tasks.indexOf(task);
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item', task.priority);
            if (task.completed) {
                taskItem.classList.add('completed');
            }

            taskItem.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} data-index="${originalIndex}">
                    <span class="task-text">${escapeHTML(task.text)}</span>
                    <span class="priority-badge ${task.priority}">${task.priority.toUpperCase()}</span>
                </div>
                <div class="task-actions">
                    <button class="edit-btn" data-index="${originalIndex}">Edit</button>
                    <button class="remove-btn" data-index="${originalIndex}">Remove</button>
                </div>
            `;

            taskList.appendChild(taskItem);
        });
    }

    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Add new task
    function addTask() {
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (taskText) {
            tasks.push({ 
                text: taskText, 
                completed: false, 
                priority: priority,
                timestamp: Date.now()
            });
            taskInput.value = '';
            saveTasks();
            renderTasks();
        }
    }

    // Toggle task completion
    taskList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const index = e.target.dataset.index;
            tasks[index].completed = e.target.checked;
            saveTasks();
            renderTasks();
        }
    });

    // Handle task actions
    taskList.addEventListener('click', (e) => {
        const index = e.target.dataset.index;
        
        if (e.target.classList.contains('remove-btn')) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks();
        } else if (e.target.classList.contains('edit-btn')) {
            const newText = prompt('Edit task:', tasks[index].text);
            if (newText && newText.trim()) {
                tasks[index].text = newText.trim();
                saveTasks();
                renderTasks();
            }
        }
    });

    // Filter functionality
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Clear all completed tasks
    document.getElementById('clear-completed-btn').addEventListener('click', () => {
        if (!tasks.some(task => task.completed)) return;
        if (confirm('Remove all completed tasks?')) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    });

    // Add task on button click
    addTaskBtn.addEventListener('click', addTask);

    // Add task on pressing Enter key
    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    // Initial render
    renderTasks();
});