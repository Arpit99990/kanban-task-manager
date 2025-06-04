/**
 * Kanban Task Manager
 * A drag-and-drop task management application
 */

class KanbanApp {
    constructor() {
        // Initialize task data
        this.tasks = {
            todo: [
                { id: '1', title: 'Plan project structure', description: 'Define components and data flow' },
                { id: '2', title: 'Set up development environment', description: 'Install dependencies and configure tools' }
            ],
            inProgress: [
                { id: '3', title: 'Implement drag and drop', description: 'Add drag and drop functionality for tasks' }
            ],
            done: [
                { id: '4', title: 'Create initial layout', description: 'Design the basic Kanban board structure' }
            ]
        };

        this.draggedTask = null;
        this.editingTask = null;

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.bindEventListeners();
        this.renderTasks();
        this.setupDropzones();
    }

    /**
     * Bind all event listeners
     */
    bindEventListeners() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const cancelTaskBtn = document.getElementById('cancelTaskBtn');

        addTaskBtn.addEventListener('click', () => this.showAddForm());
        saveTaskBtn.addEventListener('click', () => this.addTask());
        cancelTaskBtn.addEventListener('click', () => this.hideAddForm());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddForm();
                this.cancelEdit();
            }
        });
    }

    /**
     * Show the add task form
     */
    showAddForm() {
        const form = document.getElementById('addTaskForm');
        const titleInput = document.getElementById('taskTitle');
        
        form.classList.remove('hidden');
        form.classList.add('form-slide-in');
        titleInput.focus();
    }

    /**
     * Hide the add task form
     */
    hideAddForm() {
        const form = document.getElementById('addTaskForm');
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const columnSelect = document.getElementById('taskColumn');

        form.classList.add('hidden');
        form.classList.remove('form-slide-in');
        
        // Reset form
        titleInput.value = '';
        descriptionInput.value = '';
        columnSelect.value = 'todo';
    }

    /**
     * Add a new task
     */
    addTask() {
        const titleInput = document.getElementById('taskTitle');
        const descriptionInput = document.getElementById('taskDescription');
        const columnSelect = document.getElementById('taskColumn');

        const title = titleInput.value.trim();
        if (!title) {
            this.showError('Task title is required');
            return;
        }

        const task = {
            id: Date.now().toString(),
            title: title,
            description: descriptionInput.value.trim()
        };

        const column = columnSelect.value;
        this.tasks[column].push(task);
        
        this.hideAddForm();
        this.renderTasks();
        this.updateTaskCount(column);
    }

    /**
     * Delete a task
     */
    deleteTask(taskId, column) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks[column] = this.tasks[column].filter(task => task.id !== taskId);
            this.renderTasks();
            this.updateTaskCount(column);
        }
    }

    /**
     * Start editing a task
     */
    startEdit(taskId, column) {
        const task = this.tasks[column].find(t => t.id === taskId);
        if (!task) return;

        this.editingTask = { ...task, column };
        this.renderTasks();
    }

    /**
     * Save edited task
     */
    saveEdit(taskId, column) {
        const titleInput = document.querySelector(`#edit-title-${taskId}`);
        const descriptionInput = document.querySelector(`#edit-description-${taskId}`);
        
        const title = titleInput.value.trim();
        if (!title) {
            this.showError('Task title is required');
            return;
        }

        const taskIndex = this.tasks[column].findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[column][taskIndex] = {
                id: taskId,
                title: title,
                description: descriptionInput.value.trim()
            };
        }

        this.editingTask = null;
        this.renderTasks();
    }

    /**
     * Cancel editing
     */
    cancelEdit() {
        this.editingTask = null;
        this.renderTasks();
    }

    /**
     * Create task HTML
     */
    createTaskHTML(task, column) {
        const isEditing = this.editingTask && this.editingTask.id === task.id;
        
        if (isEditing) {
            return `
                <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div class="space-y-3">
                        <input type="text" id="edit-title-${task.id}" value="${this.escapeHtml(task.title)}" 
                               class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <textarea id="edit-description-${task.id}" 
                                  class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none">${this.escapeHtml(task.description)}</textarea>
                        <div class="flex gap-2">
                            <button onclick="kanbanApp.saveEdit('${task.id}', '${column}')" 
                                    class="btn-success">Save</button>
                            <button onclick="kanbanApp.cancelEdit()" 
                                    class="btn-secondary">Cancel</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="task-card bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-shadow group" 
                 draggable="true" 
                 data-task-id="${task.id}" 
                 data-column="${column}"
                 tabindex="0">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-medium text-gray-800 flex-1">${this.escapeHtml(task.title)}</h3>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
                        </svg>
                        <button onclick="kanbanApp.startEdit('${task.id}', '${column}')" 
                                class="text-blue-500 hover:text-blue-700 p-1" 
                                title="Edit task">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                        <button onclick="kanbanApp.deleteTask('${task.id}', '${column}')" 
                                class="text-red-500 hover:text-red-700 p-1" 
                                title="Delete task">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                ${task.description ? `<p class="text-gray-600 text-sm">${this.escapeHtml(task.description)}</p>` : ''}
            </div>
        `;
    }

    /**
     * Render all tasks
     */
    renderTasks() {
        Object.keys(this.tasks).forEach(column => {
            const container = document.querySelector(`#${column} .task-container`);
            const countSpan = document.querySelector(`#${column} .task-count`);
            
            container.innerHTML = this.tasks[column]
                .map(task => this.createTaskHTML(task, column))
                .join('');
            
            countSpan.textContent = this.tasks[column].length;
        });

        this.setupDragAndDrop();
    }

    /**
     * Setup drag and drop for tasks
     */
    setupDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
    }

    /**
     * Setup drop zones
     */
    setupDropzones() {
        const dropZones = document.querySelectorAll('.drop-zone');
        
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
            zone.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    /**
     * Handle drag start
     */
    handleDragStart(e) {
        this.draggedTask = {
            id: e.target.dataset.taskId,
            sourceColumn: e.target.dataset.column
        };
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    /**
     * Handle drag end
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedTask = null;
    }

    /**
     * Handle drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Handle drag enter
     */
    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('drop-zone')) {
            e.target.classList.add('drag-over');
        }
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e) {
        if (e.target.classList.contains('drop-zone')) {
            e.target.classList.remove('drag-over');
        }
    }

    /**
     * Handle drop
     */
    handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        if (!dropZone || !this.draggedTask) return;

        dropZone.classList.remove('drag-over');
        
        const targetColumn = dropZone.id;
        const { id: taskId, sourceColumn } = this.draggedTask;
        
        if (sourceColumn === targetColumn) return;

        // Move task from source to target column
        const taskIndex = this.tasks[sourceColumn].findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            const task = this.tasks[sourceColumn].splice(taskIndex, 1)[0];
            this.tasks[targetColumn].push(task);
            this.renderTasks();
            this.updateTaskCount(sourceColumn);
            this.updateTaskCount(targetColumn);
        }
    }

    /**
     * Update task count with animation
     */
    updateTaskCount(column) {
        const countSpan = document.querySelector(`#${column} .task-count`);
        countSpan.classList.add('updated');
        setTimeout(() => {
            countSpan.classList.remove('updated');
        }, 300);
    }

    /**
     * Show error message
     */
    showError(message) {
        // Simple error handling - in a real app, you'd want a proper notification system
        alert(message);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.kanbanApp = new KanbanApp();
});