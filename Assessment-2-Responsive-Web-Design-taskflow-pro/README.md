# TaskFlow Pro - Multi-Device Web Application

A responsive productivity dashboard combining task management with live weather data for Dubai, UAE. Optimized for mobile, tablet, and desktop devices.

## 🚀 Features

### Front-end
- **Fully Responsive Design**: Mobile-first approach with breakpoints at 480px, 768px, and 1024px
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Interactive Task Management**: Create, read, update, and delete tasks
- **Real-time Statistics**: Task completion progress and category breakdown
- **Modern UI**: Clean interface with CSS Grid, Flexbox, and smooth animations
- **Accessibility**: Semantic HTML, ARIA labels, proper contrast ratios

### Back-end
- **RESTful API**: Express.js server with multiple endpoints
- **Task Management**: Full CRUD operations with JSON persistence
- **Weather Integration**: Live Dubai weather data with fallback mock data
- **Daily Inspiration**: Random quote generator
- **Error Handling**: Graceful degradation for API failures

## 📱 Device Support

| Device Type | Breakpoint | Layout |
|-------------|------------|---------|
| Mobile | < 768px | Single column, stacked |
| Tablet | 768px - 1024px | Two columns (2fr 1fr) |
| Desktop | > 1024px | Optimized dashboard layout |

## 🛠️ Tech Stack

- **Front-end**: HTML5, SCSS/CSS3, JavaScript (ES6+)
- **Back-end**: Node.js, Express.js
- **APIs**: OpenWeatherMap (weather), internal REST API
- **Tools**: Git, npm, Font Awesome, Google Fonts

## 📁 Project Structure

taskflow-pro/
├── server.js # Express server configuration
├── package.json # Dependencies and scripts
├── public/ # Static files
│ ├── index.html # Main HTML document
│ ├── css/styles.css # Compiled CSS styles
│ └── js/app.js # Frontend JavaScript
├── data/ # JSON data storage
│ ├── tasks.json # Task database
│ └── quotes.json # Inspiration quotes
└── README.md # Project documentation



