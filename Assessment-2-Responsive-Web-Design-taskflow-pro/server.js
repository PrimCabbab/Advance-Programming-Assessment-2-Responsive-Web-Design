// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Data files paths
const TASKS_FILE = path.join(__dirname, 'data', 'tasks.json');
const QUOTES_FILE = path.join(__dirname, 'data', 'quotes.json');

// Initialize data files if they don't exist
async function initializeDataFiles() {
    try {
        await fs.access(TASKS_FILE);
    } catch {
        const initialTasks = [
            { id: 1, title: "Complete web app assignment", completed: false, priority: "high", category: "Study", dueDate: "2025-01-15" },
            { id: 2, title: "Review project documentation", completed: true, priority: "medium", category: "Work", dueDate: "2025-01-12" },
            { id: 3, title: "Plan weekly schedule", completed: false, priority: "medium", category: "Personal", dueDate: "2025-01-14" },
            { id: 4, title: "Research responsive design patterns", completed: false, priority: "low", category: "Study", dueDate: "2025-01-20" }
        ];
        await fs.writeFile(TASKS_FILE, JSON.stringify(initialTasks, null, 2));
    }

    try {
        await fs.access(QUOTES_FILE);
    } catch {
        const initialQuotes = [
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
        ];
        await fs.writeFile(QUOTES_FILE, JSON.stringify(initialQuotes, null, 2));
    }
}

// API Routes
// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        console.error('Error reading tasks:', error);
        res.status(500).json({ error: 'Failed to load tasks' });
    }
});

// Add new task
app.post('/api/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        const newTask = {
            id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
            ...req.body,
            completed: false,
            createdAt: new Date().toISOString()
        };
        tasks.push(newTask);
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        let tasks = JSON.parse(data);
        const taskId = parseInt(req.params.id);
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        tasks[taskIndex] = { ...tasks[taskIndex], ...req.body };
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
        res.json(tasks[taskIndex]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        let tasks = JSON.parse(data);
        const taskId = parseInt(req.params.id);
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        
        if (tasks.length === filteredTasks.length) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        await fs.writeFile(TASKS_FILE, JSON.stringify(filteredTasks, null, 2));
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Weather API (using free OpenWeatherMap - you'll need to get an API key)
app.get('/api/weather', async (req, res) => {
    try {
        const city = req.query.city || 'London';
        const apiKey = process.env.WEATHER_API_KEY || 'YOUR_API_KEY_HERE';
        
        // If no API key, return mock data for demonstration
        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            const mockWeather = {
                name: city,
                main: {
                    temp: Math.floor(Math.random() * 25) + 10,
                    humidity: Math.floor(Math.random() * 50) + 30,
                    feels_like: Math.floor(Math.random() * 25) + 10
                },
                weather: [{
                    description: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
                    icon: '01d'
                }],
                wind: {
                    speed: (Math.random() * 10).toFixed(1)
                }
            };
            return res.json(mockWeather);
        }

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        console.error('Weather API error:', error.message);
        // Return mock data on error
        const mockWeather = {
            name: req.query.city || 'Dubai',
            main: { temp: 18, humidity: 65, feels_like: 18 },
            weather: [{ description: 'Partly Cloudy', icon: '02d' }],
            wind: { speed: 5.2 }
        };
        res.json(mockWeather);
    }
});

// Get random quote
app.get('/api/quote', async (req, res) => {
    try {
        const data = await fs.readFile(QUOTES_FILE, 'utf8');
        const quotes = JSON.parse(data);
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        res.json(randomQuote);
    } catch (error) {
        console.error('Error reading quotes:', error);
        res.json({ 
            text: "The only way to do great work is to love what you do.", 
            author: "Steve Jobs" 
        });
    }
});

// Statistics endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const data = await fs.readFile(TASKS_FILE, 'utf8');
        const tasks = JSON.parse(data);
        
        const stats = {
            total: tasks.length,
            completed: tasks.filter(t => t.completed).length,
            pending: tasks.filter(t => !t.completed).length,
            highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
            byCategory: {}
        };
        
        tasks.forEach(task => {
            if (!stats.byCategory[task.category]) {
                stats.byCategory[task.category] = 0;
            }
            stats.byCategory[task.category]++;
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

// Start server
initializeDataFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📱 Mobile view: http://localhost:${PORT} (resize to < 768px)`);
        console.log(`💻 Desktop view: http://localhost:${PORT} (resize to > 1024px)`);
    });
}).catch(err => {
    console.error('Failed to initialize data files:', err);
});