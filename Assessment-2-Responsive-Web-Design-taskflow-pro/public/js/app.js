// public/js/app.js
class TaskFlowApp {
    constructor() {
        this.init();
    }

    async init() {
        // Initialize theme
        this.initTheme();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Load initial data
        await this.loadAllData();
    }

    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle.querySelector('i');
        const themeText = themeToggle.querySelector('span');
        
        // Check for saved theme or prefer-color-scheme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
        
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeIcon.className = 'fas fa-sun';
            themeText.textContent = 'Light Mode';
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            
            if (document.body.classList.contains('dark-theme')) {
                themeIcon.className = 'fas fa-sun';
                themeText.textContent = 'Light Mode';
                localStorage.setItem('theme', 'dark');
            } else {
                themeIcon.className = 'fas fa-moon';
                themeText.textContent = 'Dark Mode';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    initEventListeners() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
    }

    async loadAllData() {
        try {
            // Load tasks
            const tasks = await this.fetchData('/api/tasks');
            this.renderTasks(tasks);
            
            // Load weather
            await this.loadWeather();
            
            // Load quote
            await this.loadQuote();
            
            // Load stats
            await this.loadStats();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please refresh the page.');
        }
    }

    async fetchData(endpoint, options = {}) {
        const response = await fetch(endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    renderTasks(tasks) {
        const taskList = document.getElementById('taskList');
        
        if (!tasks || tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list fa-3x"></i>
                    <h3>No tasks yet</h3>
                    <p>Add your first task above to get started!</p>
                </div>
            `;
            return;
        }
        
        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTask(${task.id})">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="badge category">${task.category}</span>
                        <span class="badge priority-${task.priority}">
                            ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                        </span>
                        ${task.dueDate ? `<span class="badge due-date"><i class="far fa-calendar"></i> ${new Date(task.dueDate).toLocaleDateString()}</span>` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button onclick="app.deleteTask(${task.id})" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    async addTask() {
        const form = document.getElementById('taskForm');
        const title = document.getElementById('taskTitle').value;
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        
        if (!title.trim()) return;
        
        try {
            const newTask = {
                title: title.trim(),
                category,
                priority,
                dueDate: dueDate || null
            };
            
            const task = await this.fetchData('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newTask)
            });
            
            // Reload tasks and stats
            await this.loadAllData();
            
            // Reset form
            form.reset();
            document.getElementById('taskTitle').focus();
            
            // Show success message
            this.showNotification('Task added successfully!', 'success');
            
        } catch (error) {
            console.error('Error adding task:', error);
            this.showNotification('Failed to add task', 'error');
        }
    }

    async toggleTask(taskId) {
        try {
            const taskList = document.getElementById('taskList');
            const taskItem = taskList.querySelector(`[data-id="${taskId}"]`);
            const isCompleted = taskItem.classList.contains('completed');
            
            await this.fetchData(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !isCompleted })
            });
            
            // Reload tasks and stats
            await this.loadAllData();
            
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showNotification('Failed to update task', 'error');
        }
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        try {
            await this.fetchData(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            // Reload tasks and stats
            await this.loadAllData();
            
            this.showNotification('Task deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showNotification('Failed to delete task', 'error');
        }
    }

    async loadWeather(city = 'Dubai') {
        const weatherContent = document.getElementById('weatherContent');
        
        try {
            const weather = await this.fetchData(`/api/weather?city=${city}`);
            
            weatherContent.innerHTML = `
                <div class="temperature">${Math.round(weather.main.temp)}°C</div>
                <div class="description">${weather.weather[0].description}</div>
                <div class="location">
                    <i class="fas fa-map-marker-alt"></i> ${weather.name}
                </div>
                <div class="weather-details">
                    <div class="detail-item">
                        <div class="label">Feels Like</div>
                        <div class="value">${Math.round(weather.main.feels_like)}°C</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Humidity</div>
                        <div class="value">${weather.main.humidity}%</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Wind Speed</div>
                        <div class="value">${weather.wind.speed} m/s</div>
                    </div>
                    <div class="detail-item">
                        <div class="label">Pressure</div>
                        <div class="value">${weather.main.pressure} hPa</div>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading weather:', error);
            weatherContent.innerHTML = `
                <div class="error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Weather data unavailable</p>
                </div>
            `;
        }
    }

    async loadQuote() {
        const quoteContent = document.getElementById('quoteContent');
        
        try {
            const quote = await this.fetchData('/api/quote');
            
            quoteContent.innerHTML = `
                <div class="quote-text">"${this.escapeHtml(quote.text)}"</div>
                <div class="quote-author">— ${this.escapeHtml(quote.author)}</div>
            `;
            
        } catch (error) {
            console.error('Error loading quote:', error);
            quoteContent.innerHTML = `
                <div class="error">
                    <p>Unable to load quote</p>
                </div>
            `;
        }
    }

    async loadStats() {
        const statsGrid = document.getElementById('statsGrid');
        const progressContainer = document.getElementById('progressContainer');
        
        try {
            const stats = await this.fetchData('/api/stats');
            
            statsGrid.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Tasks</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.completed}</div>
                    <div class="stat-label">Completed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.pending}</div>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.highPriority}</div>
                    <div class="stat-label">High Priority</div>
                </div>
            `;
            
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            progressContainer.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>Completion Progress</span>
                    <span>${completionRate}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${completionRate}%"></div>
                </div>
            `;
            
        } catch (error) {
            console.error('Error loading stats:', error);
            statsGrid.innerHTML = `
                <div class="error">
                    <p>Unable to load statistics</p>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add CSS animations
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(errorDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskFlowApp();
});

// Add CSS for dark theme with better contrast
const darkThemeCSS = `
    body.dark-theme {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: #e2e8f0;
    }
    
    body.dark-theme .task-manager h2,
    body.dark-theme .weather-widget h3,
    body.dark-theme .stats-widget h3 {
        color: #e2e8f0 !important;
    }
    
    body.dark-theme .header h1 {
        background: linear-gradient(135deg, #7c93e6, #6a5de8);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    body.dark-theme .task-manager,
    body.dark-theme .weather-widget,
    body.dark-theme .stats-widget {
        background: #1e293b;
        color: #e2e8f0;
        border: 1px solid #334155;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }
    
    body.dark-theme .task-item {
        background: #1e293b;
        border-color: #475569;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    
    body.dark-theme .task-form {
        background: #0f172a;
        border: 1px solid #334155;
    }
    
    body.dark-theme input,
    body.dark-theme select {
        background: #2d3748;
        color: #e2e8f0;
        border-color: #4a5568;
    }
    
    body.dark-theme input:focus,
    body.dark-theme select:focus {
        border-color: #7c93e6;
        background: #374151;
    }
    
    body.dark-theme .stat-item {
        background: #0f172a;
        border: 1px solid #334155;
    }
    
    body.dark-theme .theme-toggle {
        background: #2d3748;
        border-color: #4a5568;
        color: #e2e8f0;
    }
    
    body.dark-theme .theme-toggle:hover {
        background: #374151;
    }
    
    body.dark-theme .progress-bar {
        background: #2d3748;
    }
    
    body.dark-theme .footer {
        border-top-color: #334155;
        color: #94a3b8;
    }
    
    body.dark-theme .task-checkbox {
        border-color: #94a3b8;
    }
    
    body.dark-theme .task-checkbox.checked {
        background: #10b981;
        border-color: #10b981;
    }
    
    body.dark-theme .badge.category {
        background: rgba(124, 147, 230, 0.2);
        color: #a5b4fc;
    }
    
    body.dark-theme .badge.priority-high {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
    }
    
    body.dark-theme .badge.priority-medium {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
    }
    
    body.dark-theme .badge.priority-low {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
    }
    
    body.dark-theme .weather-details .detail-item {
        background: #0f172a;
        border: 1px solid #334155;
    }
    
    body.dark-theme .error {
        background: rgba(239, 68, 68, 0.1);
        color: #fca5a5;
        border-left-color: #ef4444;
    }
    
    body.dark-theme .loading {
        color: #94a3b8;
    }
    
    /* Make buttons more visible in dark mode */
    body.dark-theme .btn-primary {
        background: #4361ee;
        color: white;
    }
    
    body.dark-theme .btn-primary:hover {
        background: #3a56d4;
    }
`;

