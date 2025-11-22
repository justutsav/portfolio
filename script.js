// State Management
let zIndexCounter = 100;
const projects = [
    {
        title: "Retro Game",
        img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop",
        desc: "A 8-bit platformer built with Phaser.",
        link: "https://github.com"
    },
    {
        title: "Weather App",
        img: "https://images.unsplash.com/photo-1592210454359-9043f067919b?q=80&w=2670&auto=format&fit=crop",
        desc: "Real-time weather data visualization.",
        link: "https://github.com"
    },
    {
        title: "E-Commerce",
        img: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=2670&auto=format&fit=crop",
        desc: "Full stack shop with cart functionality.",
        link: "https://github.com"
    },
    {
        title: "Portfolio v1",
        img: "https://images.unsplash.com/photo-1481487484168-9b930d5b7d9f?q=80&w=2670&auto=format&fit=crop",
        desc: "My previous portfolio site.",
        link: "https://github.com"
    }
];

// Boot Sequence
window.addEventListener('load', () => {
    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.classList.remove('active');
            document.getElementById('lock-screen').classList.add('active');
            startClock();
        }, 500);
    }, 3500); // 3.5s boot time
});

// Lock Screen
document.getElementById('login-trigger').addEventListener('click', () => {
    const lockScreen = document.getElementById('lock-screen');
    lockScreen.style.transform = 'translateY(-100%)';
    setTimeout(() => {
        lockScreen.classList.remove('active');
        document.getElementById('desktop-screen').classList.add('active');
        document.getElementById('desktop-screen').style.display = 'flex'; // Ensure flex display
    }, 500);
});

// Clock
function startClock() {
    const updateTime = () => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
        
        const lockTime = document.getElementById('lock-time');
        const lockDate = document.getElementById('lock-date');
        const taskbarTime = document.getElementById('taskbar-time');

        if (lockTime) lockTime.textContent = timeString;
        if (lockDate) lockDate.textContent = dateString;
        if (taskbarTime) taskbarTime.textContent = timeString;
    };
    updateTime();
    setInterval(updateTime, 1000);
}

// Window Management
function openWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.display = 'flex';
        bringToFront(win);
        
        // Center window on first open if not moved
        if (!win.dataset.moved) {
            const desktop = document.getElementById('desktop-screen');
            const x = (desktop.clientWidth - win.clientWidth) / 2;
            const y = (desktop.clientHeight - win.clientHeight) / 2;
            win.style.left = `${x}px`;
            win.style.top = `${y}px`;
        }
    }
    
    // Close start menu if open
    document.getElementById('start-menu').style.display = 'none';
}

function closeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.display = 'none';
    }
}

function minimizeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) {
        win.style.display = 'none';
    }
}

function bringToFront(element) {
    zIndexCounter++;
    element.style.zIndex = zIndexCounter;
}

// Drag Logic
let isDragging = false;
let currentWindow = null;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.title-bar')) {
        const win = e.target.closest('.window');
        if (win) {
            isDragging = true;
            currentWindow = win;
            bringToFront(win);
            
            // Mark as moved so we don't auto-center again
            win.dataset.moved = "true";

            initialX = e.clientX - win.offsetLeft;
            initialY = e.clientY - win.offsetTop;
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentWindow) {
        e.preventDefault();
        const currentX = e.clientX - initialX;
        const currentY = e.clientY - initialY;

        // Boundary checks (optional, but good for UX)
        // For now, just let it fly free like Windows
        currentWindow.style.left = `${currentX}px`;
        currentWindow.style.top = `${currentY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    currentWindow = null;
});

// Start Menu
function toggleStartMenu() {
    const menu = document.getElementById('start-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        zIndexCounter++;
        menu.style.zIndex = zIndexCounter + 100; // Always on top of windows
    } else {
        menu.style.display = 'none';
    }
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');
    
    if (menu.style.display === 'flex' && 
        !menu.contains(e.target) && 
        !startBtn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Populate Chrome Projects
const projectsContainer = document.getElementById('projects-container');
projects.forEach(proj => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.onclick = () => window.open(proj.link, '_blank');
    
    card.innerHTML = `
        <img src="${proj.img}" class="project-img pixelated" alt="${proj.title}">
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.desc}</p>
    `;
    
    projectsContainer.appendChild(card);
});
