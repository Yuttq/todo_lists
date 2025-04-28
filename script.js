class TodoApp {
    constructor() {
        this.elements = {
            addTaskBtn: document.getElementById('add-task-btn'),
            taskInput: document.getElementById('task-input'),
            dueDateInput: document.getElementById('due-date'),
            taskList: document.getElementById('task-list'),
            filterButtons: document.querySelectorAll('.filter-buttons button'),
            clearTasksBtn: document.getElementById('clear-tasks-btn'),
            toggleDarkModeBtn: document.getElementById('toggle-dark-mode'),
            taskCount: document.getElementById('task-count')
        };

        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTasks();
        this.loadDarkMode();
        this.updateTaskCount();
    }

    setupEventListeners() {
        this.elements.addTaskBtn.addEventListener('click', () => this.addTask());
        this.elements.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });
        
        this.elements.clearTasksBtn.addEventListener('click', () => this.clearAllTasks());
        this.elements.toggleDarkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        
        this.elements.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentFilter = button.dataset.filter;
                this.updateFilterButtons();
                this.filterTasks(this.currentFilter);
            });
        });
    }

    addTask() {
        const taskText = this.elements.taskInput.value.trim();
        const dueDate = this.elements.dueDateInput.value;

        if (taskText !== "") {
            const task = {
                id: Date.now().toString(),
                text: taskText,
                dueDate: dueDate,
                completed: false,
                createdAt: new Date().toISOString()
            };

            this.createTaskElement(task);
            this.saveTask(task);
            this.elements.taskInput.value = "";
            this.elements.dueDateInput.value = "";
            this.updateTaskCount();
            this.elements.taskInput.focus();
        }
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        if (task.completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));

        const span = document.createElement('span');
        span.textContent = task.text;

        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        if (task.dueDate) {
            dateSpan.textContent = this.formatDate(task.dueDate);
        }

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => this.editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(dateSpan);
        li.appendChild(actionsDiv);

        this.elements.taskList.appendChild(li);
    }

    editTask(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const newText = prompt('Edit your task:', task.text);
        if (newText !== null && newText.trim() !== "") {
            task.text = newText.trim();
            this.saveTasks(tasks);
            this.loadTasks();
        }
    }

    deleteTask(taskId) {
        const li = document.querySelector(`li[data-id="${taskId}"]`);
        if (!li) return;

        li.classList.add('fade-out');
        setTimeout(() => {
            const tasks = this.getTasks().filter(task => task.id !== taskId);
            this.saveTasks(tasks);
            this.updateTaskCount();
            li.remove();
        }, 400);
    }

    toggleTaskCompletion(taskId) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks(tasks);
            this.filterTasks(this.currentFilter);
            this.updateTaskCount();
        }
    }

    saveTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
    }

    saveTasks(tasks) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    getTasks() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    loadTasks() {
        this.elements.taskList.innerHTML = '';
        const tasks = this.getTasks().sort((a, b) => {
            // Sort by completion status (pending first)
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            
            // Then sort by due date (earlier first)
            if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            
            // Finally sort by creation date (newer first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        tasks.forEach(task => this.createTaskElement(task));
        this.filterTasks(this.currentFilter);
    }

    filterTasks(filter) {
        const tasks = this.elements.taskList.querySelectorAll('li');
        tasks.forEach(task => {
            const isCompleted = task.classList.contains('completed');
            
            switch(filter) {
                case 'all':
                    task.style.display = '';
                    break;
                case 'completed':
                    task.style.display = isCompleted ? '' : 'none';
                    break;
                case 'pending':
                    task.style.display = !isCompleted ? '' : 'none';
                    break;
            }
        });
    }

    updateFilterButtons() {
        this.elements.filterButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === this.currentFilter);
        });
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks?')) {
            localStorage.removeItem('tasks');
            this.elements.taskList.innerHTML = '';
            this.updateTaskCount();
        }
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    }

    loadDarkMode() {
        const darkMode = JSON.parse(localStorage.getItem('darkMode'));
        if (darkMode) {
            document.body.classList.add('dark-mode');
        }
    }

    updateTaskCount() {
        const tasks = this.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        this.elements.taskCount.textContent = `${completed} of ${total} tasks completed`;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});