const addTaskBtn = document.getElementById('add-task-btn');
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const clearTasksBtn = document.getElementById('clear-tasks-btn');

// Load tasks when page loads
window.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadDarkMode();
});

// Add Task
function addTask() {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    if (taskText !== "") {
        const li = createTaskElement(taskText, dueDate, false);
        taskList.appendChild(li);
        saveTask(taskText, dueDate, false);
        taskInput.value = "";
        dueDateInput.value = "";
    }
}

// Create Task Element
function createTaskElement(taskText, dueDate, completed) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = `${taskText} ${dueDate ? `- Due: ${dueDate}` : ""}`;

    if (completed) {
        li.classList.add('completed');
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';

    deleteBtn.addEventListener('click', function () {
        li.classList.add('fade-out');
        setTimeout(() => {
            taskList.removeChild(li);
            deleteTask(taskText);
        }, 400);
    });

    editBtn.addEventListener('click', function () {
        const newTaskText = prompt('Edit your task:', taskText);
        if (newTaskText !== null && newTaskText.trim() !== "") {
            updateTask(taskText, newTaskText);
            span.textContent = `${newTaskText} ${dueDate ? `- Due: ${dueDate}` : ""}`;
            taskText = newTaskText; // Update local variable
        }
    });

    span.addEventListener('click', function () {
        li.classList.toggle('completed');
        toggleTaskCompletion(taskText);
    });

    li.appendChild(span);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    return li;
}

// Save Task to localStorage
function saveTask(taskText, dueDate, completed) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push({ text: taskText, dueDate: dueDate, completed: completed });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Delete Task from localStorage
function deleteTask(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.text !== taskText);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Update Task in localStorage
function updateTask(oldText, newText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.text === oldText) {
            task.text = newText;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Toggle Completed State
function toggleTaskCompletion(taskText) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.text === taskText) {
            task.completed = !task.completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load Tasks and Sort by Due Date
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.sort((a, b) => {
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return 0; // If there's no due date, don't change the order
    });
    tasks.forEach(task => {
        const li = createTaskElement(task.text, task.dueDate, task.completed);
        taskList.appendChild(li);
    });
}

// Filter Tasks
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        filterTasks(filter);
    });
});

function filterTasks(filter) {
    const tasks = taskList.querySelectorAll('li');
    tasks.forEach(task => {
        const isCompleted = task.classList.contains('completed');
        if (filter === 'all') {
            task.style.display = '';
        } else if (filter === 'completed' && !isCompleted) {
            task.style.display = 'none';
        } else if (filter === 'pending' && isCompleted) {
            task.style.display = 'none';
        } else {
            task.style.display = '';
        }
    });
}

// Clear All Tasks
clearTasksBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all tasks?')) {
        localStorage.removeItem('tasks');
        taskList.innerHTML = '';
    }
});

// Dark Mode
const darkModeBtn = document.getElementById('toggle-dark-mode');

darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.querySelector('.todo-container').classList.toggle('dark-mode');

    const listItems = document.querySelectorAll('li');
    listItems.forEach(item => {
        item.classList.toggle('dark-mode');
    });

    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

function loadDarkMode() {
    const darkMode = JSON.parse(localStorage.getItem('darkMode'));
    if (darkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.todo-container').classList.add('dark-mode');
        const listItems = document.querySelectorAll('li');
        listItems.forEach(item => {
            item.classList.add('dark-mode');
        });
    }
}

// Add task event
addTaskBtn.addEventListener('click', addTask);
