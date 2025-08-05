// DevTools Hub - Multi-Tool Workspace JavaScript

class Timer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.interval = null;
        this.totalSeconds = 0;
        this.remainingSeconds = 0;
        this.startTime = null;
        this.pauseTime = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.hoursDisplay = document.getElementById('hours');
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.statusDisplay = document.getElementById('timer-status');
        
        this.hoursInput = document.getElementById('hours-input');
        this.minutesInput = document.getElementById('minutes-input');
        this.secondsInput = document.getElementById('seconds-input');
        
        this.startBtn = document.getElementById('start-timer');
        this.pauseBtn = document.getElementById('pause-timer');
        this.resetBtn = document.getElementById('reset-timer');
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Auto-save timer input values
        [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
            input.addEventListener('input', () => this.saveInputValues());
        });
        
        // Load saved values on page load
        this.loadInputValues();
    }

    start() {
        if (!this.isRunning) {
            if (!this.isPaused) {
                // New timer start
                const hours = parseInt(this.hoursInput.value) || 0;
                const minutes = parseInt(this.minutesInput.value) || 0;
                const seconds = parseInt(this.secondsInput.value) || 0;
                
                this.totalSeconds = hours * 3600 + minutes * 60 + seconds;
                this.remainingSeconds = this.totalSeconds;
                
                if (this.totalSeconds === 0) {
                    this.showNotification('Please set a time first!', 'warning');
                    return;
                }
            }
            
            this.isRunning = true;
            this.isPaused = false;
            this.startTime = Date.now() - (this.totalSeconds - this.remainingSeconds) * 1000;
            
            this.interval = setInterval(() => this.updateDisplay(), 1000);
            this.updateStatus('running');
            this.startBtn.textContent = 'Resume';
            this.pauseBtn.disabled = false;
        }
    }

    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.pauseTime = Date.now();
            clearInterval(this.interval);
            this.updateStatus('paused');
            this.startBtn.textContent = 'Resume';
        }
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.interval);
        this.remainingSeconds = 0;
        this.totalSeconds = 0;
        this.startTime = null;
        this.pauseTime = null;
        
        this.updateDisplay();
        this.updateStatus('ready');
        this.startBtn.textContent = 'Start';
        this.pauseBtn.disabled = true;
    }

    updateDisplay() {
        if (this.isRunning) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.remainingSeconds = Math.max(0, this.totalSeconds - elapsed);
            
            if (this.remainingSeconds === 0) {
                this.timerComplete();
                return;
            }
        }
        
        const hours = Math.floor(this.remainingSeconds / 3600);
        const minutes = Math.floor((this.remainingSeconds % 3600) / 60);
        const seconds = this.remainingSeconds % 60;
        
        this.hoursDisplay.textContent = hours.toString().padStart(2, '0');
        this.minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        this.secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }

    timerComplete() {
        this.reset();
        this.showNotification('Timer completed!', 'success');
        this.playNotificationSound();
    }

    updateStatus(status) {
        this.statusDisplay.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        this.statusDisplay.className = `tool-status ${status}`;
    }

    saveInputValues() {
        const values = {
            hours: this.hoursInput.value,
            minutes: this.minutesInput.value,
            seconds: this.secondsInput.value
        };
        localStorage.setItem('timerInputs', JSON.stringify(values));
    }

    loadInputValues() {
        const saved = localStorage.getItem('timerInputs');
        if (saved) {
            const values = JSON.parse(saved);
            this.hoursInput.value = values.hours || '';
            this.minutesInput.value = values.minutes || '';
            this.secondsInput.value = values.seconds || '';
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        let container;
        if (message === 'Timer completed!') {
            // Append to header notification container and position it under the light mode button.
            container = document.getElementById('header-notification-container');
            notification.style.position = 'absolute';
            notification.style.top = 'calc(100% + 5px)';
            notification.style.right = '0';
            notification.style.margin = '0';
            notification.style.transform = 'none';
            notification.style.opacity = '1';
        } else {
            container = document.body;
        }

        container.appendChild(notification);

        if (container === document.body) {
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);

            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        } else {
            // Auto-remove header notifications after a delay.
            setTimeout(() => notification.remove(), 3000);
        }
    }

    playNotificationSound() {
        // Create a simple notification sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
}

// Checklist logic (multi-task with checkbox)
function setupTaskTracker() {
    const form = document.getElementById('add-task-form');
    const input = document.getElementById('new-task-input');
    const list = document.getElementById('task-list');

    let tasks = JSON.parse(localStorage.getItem('liveTaskTrackerTasks') || '[]');

    function saveTasks() {
        localStorage.setItem('liveTaskTrackerTasks', JSON.stringify(tasks));
    }

    function render() {
        list.innerHTML = '';
        tasks.forEach((task, idx) => {
            const li = document.createElement('li');
            li.className = 'tracker-task-item';
            li.setAttribute('draggable', 'true');
            li.setAttribute('data-index', idx);

            // Drag event listeners for reordering
            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', idx);
            });
            li.addEventListener('dragover', (e) => {
                e.preventDefault(); // allow drop
            });
            li.addEventListener('drop', (e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = parseInt(li.getAttribute('data-index'));
                const movedTask = tasks.splice(fromIndex, 1)[0];
                tasks.splice(toIndex, 0, movedTask);
                saveTasks();
                render();
            });

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'tracker-task-checkbox';
            checkbox.checked = task.status === 'finished';
            checkbox.title = task.status === 'finished' ? 'Finished' : 'In Progress';
            checkbox.onchange = () => {
                task.status = checkbox.checked ? 'finished' : 'in-progress';
                saveTasks();
                render();
            };
            li.appendChild(checkbox);

            // Task text
            const span = document.createElement('span');
            span.textContent = task.text;
            if (task.status === 'finished') {
                span.style.textDecoration = 'line-through';
                span.style.opacity = '0.7';
            }
            li.appendChild(span);

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'tracker-task-delete';
            delBtn.innerText = '✕';
            delBtn.title = 'Delete';
            delBtn.onclick = () => {
                tasks.splice(idx, 1);
                saveTasks();
                render();
            };
            li.appendChild(delBtn);

            list.appendChild(li);
        });

        // --- Update progress bar ---
        const progressBar = document.getElementById('task-progress-bar');
        if (tasks.length > 0) {
            const completed = tasks.filter(task => task.status === 'finished').length;
            const percent = (completed / tasks.length) * 100;
            progressBar.style.width = percent + '%';

            if (percent <= 33) {
                progressBar.style.backgroundColor = 'red';
            } else if (percent <= 66) {
                progressBar.style.backgroundColor = 'yellow';
            } else {
                progressBar.style.backgroundColor = 'green';
            }
        } else {
            progressBar.style.width = '0%';
            progressBar.style.backgroundColor = 'var(--accent-primary)';
        }
    }

    form.onsubmit = (e) => {
        e.preventDefault();
        const value = input.value.trim();
        if (!value) return;
        tasks.push({ text: value, status: 'in-progress' });
        input.value = '';
        saveTasks();
        render();
    };

    render();
}


// Notification styles
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--bg-elevated);
        color: var(--text-primary);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-primary);
        box-shadow: var(--shadow-heavy);
        font-family: var(--font-mono);
        font-size: 0.875rem;
        z-index: 1000;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        border-color: var(--accent-secondary);
        background: rgba(35, 134, 54, 0.1);
    }
    
    .notification-warning {
        border-color: var(--accent-warning);
        background: rgba(210, 153, 34, 0.1);
    }
    
    .notification-info {
        border-color: var(--accent-primary);
        background: rgba(88, 166, 255, 0.1);
    }
`;

// Add notification styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

 // Initialize all tools when DOM is loaded
 document.addEventListener('DOMContentLoaded', () => {
    window.timer = new Timer();
    setupTaskTracker();

    // Timer preset buttons (existing code)
    document.querySelectorAll('.preset').forEach(button => {
        button.addEventListener('click', () => {
            const totalMinutes = parseInt(button.getAttribute('data-minutes'));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            document.getElementById('hours-input').value = hours;
            document.getElementById('minutes-input').value = minutes;
            document.getElementById('seconds-input').value = 0;
            
            if (window.timer && window.timer.saveInputValues) {
                window.timer.saveInputValues();
            }
        });
    });

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.textContent = 'Dark Mode';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeToggle.textContent = 'Light Mode';
    }
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = 'Light Mode';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeToggle.textContent = 'Dark Mode';
            localStorage.setItem('theme', 'light');
        }
    });

});

 // Auto-save functionality
 window.addEventListener('beforeunload', () => {
     if (window.timer) window.timer.saveInputValues();
 });