// State Management
let zIndexCounter = 100;

// Data
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

const fileSystem = {
    "This PC": [
        { name: "Local Disk (C:)", type: "drive", icon: "https://img.icons8.com/color/48/hdd.png" }
    ],
    "Local Disk (C:)": [
        { name: "About Me", type: "folder", icon: "https://img.icons8.com/color/48/folder-invoices--v1.png" },
        { name: "Projects", type: "folder", icon: "https://img.icons8.com/color/48/folder-invoices--v1.png" }
    ],
    "About Me": [
        { name: "aboutme.txt", type: "file", icon: "https://img.icons8.com/color/48/notepad.png", app: "notepad" }
    ],
    "Projects": [
        { name: "projects.html", type: "file", icon: "https://img.icons8.com/color/48/chrome--v1.png", app: "chrome-projects" }
    ]
};

// Window Manager Class
class WindowManager {
    constructor() {
        this.windows = {}; // Track active windows
        this.activeWindowId = null;
    }

    open(appId, ...args) {
        const win = document.getElementById(`window-${appId}`);
        const taskIcon = document.getElementById(`task-${appId}`);

        if (!win) return;

        // If already open and hidden, restore it
        if (win.classList.contains('hidden')) {
            this.restore(appId);
            return;
        }

        // If already open and active, just bring to front
        if (win.style.display !== 'none' && !win.classList.contains('hidden')) {
            this.bringToFront(appId);
            return;
        }

        // First time opening or re-opening after close
        win.style.display = 'flex';
        win.classList.remove('hidden');
        win.classList.remove('closing');
        win.classList.add('opening');

        // Remove animation class after it finishes
        setTimeout(() => {
            win.classList.remove('opening');
        }, 200);

        this.bringToFront(appId);

        // Update Taskbar
        if (taskIcon) {
            taskIcon.classList.add('active');
            taskIcon.classList.remove('minimized');
        }

        // Center window if not moved
        if (!win.dataset.moved) {
            const desktop = document.getElementById('desktop-screen');
            const x = (desktop.clientWidth - win.clientWidth) / 2;
            const y = (desktop.clientHeight - win.clientHeight) / 2;
            win.style.left = `${x}px`;
            win.style.top = `${y}px`;
        }

        // App specific logic
        if (appId === 'chrome') {
            if (args[0] === 'projects') {
                switchChromeMode('projects');
            } else {
                switchChromeMode('newtab');
            }
        } else if (appId === 'explorer') {
            if (args[0]) {
                renderExplorer(args[0]);
            } else {
                renderExplorer('This PC');
            }
        }

        // Close start menu
        document.getElementById('start-menu').style.display = 'none';
    }

    close(appId) {
        const win = document.getElementById(`window-${appId}`);
        const taskIcon = document.getElementById(`task-${appId}`);

        if (win) {
            win.classList.add('closing');
            setTimeout(() => {
                win.style.display = 'none';
                win.classList.remove('closing', 'fullscreen', 'hidden');
                win.style.transform = ''; // Reset transform
                delete win.dataset.moved; // Reset moved state on close
            }, 200); // Match transition duration
        }

        if (taskIcon) {
            taskIcon.classList.remove('active', 'minimized');
        }
    }

    minimize(appId) {
        const win = document.getElementById(`window-${appId}`);
        const taskIcon = document.getElementById(`task-${appId}`);

        if (win) {
            win.classList.add('hidden');
        }

        if (taskIcon) {
            taskIcon.classList.remove('active');
            taskIcon.classList.add('minimized');
        }
    }

    restore(appId) {
        const win = document.getElementById(`window-${appId}`);
        const taskIcon = document.getElementById(`task-${appId}`);

        if (win) {
            win.classList.remove('hidden');
            this.bringToFront(appId);
        }

        if (taskIcon) {
            taskIcon.classList.add('active');
            taskIcon.classList.remove('minimized');
        }
    }

    toggle(appId) {
        const win = document.getElementById(`window-${appId}`);
        // Check if hidden OR display is none
        if (win.classList.contains('hidden') || win.style.display === 'none') {
            this.open(appId);
        } else {
            this.minimize(appId);
        }
    }

    maximize(appId) {
        const win = document.getElementById(`window-${appId}`);
        if (win) {
            if (win.classList.contains('fullscreen')) {
                win.classList.remove('fullscreen');
            } else {
                win.classList.add('fullscreen');
            }
        }
    }

    bringToFront(appId) {
        const win = document.getElementById(`window-${appId}`);
        if (win) {
            zIndexCounter++;
            win.style.zIndex = zIndexCounter;
            this.activeWindowId = appId;
        }
    }
}

const windowManager = new WindowManager();

// Boot Sequence
window.addEventListener('load', () => {
    // Play sound
    const audio = document.getElementById('startup-sound');
    if (audio) {
        audio.volume = 0.5;
        // Browsers block autoplay, so we might need interaction, 
        // but for a "boot" sequence we try our best.
        audio.play().catch(e => console.log("Audio autoplay blocked:", e));
    }

    setTimeout(() => {
        const bootScreen = document.getElementById('boot-screen');
        bootScreen.style.opacity = '0';
        setTimeout(() => {
            bootScreen.classList.remove('active');
            document.getElementById('lock-screen').classList.add('active');
            startClock();
        }, 500);
    }, 3500);
});

// Lock Screen
document.getElementById('login-trigger').addEventListener('click', () => {
    const lockScreen = document.getElementById('lock-screen');
    lockScreen.style.transform = 'translateY(-100%)';

    // Try playing sound again on interaction if missed
    const audio = document.getElementById('startup-sound');
    if (audio && audio.paused) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log("Audio play failed:", e));
    }

    setTimeout(() => {
        lockScreen.classList.remove('active');
        document.getElementById('desktop-screen').classList.add('active');
        document.getElementById('desktop-screen').style.display = 'flex';
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

// Drag Logic
let isDragging = false;
let currentWindow = null;
let initialX;
let initialY;

document.addEventListener('mousedown', (e) => {
    // Window Focus Logic
    const win = e.target.closest('.window');
    if (win) {
        const appId = win.dataset.app;
        if (appId) windowManager.bringToFront(appId);
    }

    // Drag Logic
    if (e.target.closest('.title-bar')) {
        const win = e.target.closest('.window');
        if (win && !win.classList.contains('fullscreen')) {
            isDragging = true;
            currentWindow = win;
            win.dataset.moved = "true";

            // Calculate offset from the window's current position
            initialX = e.clientX - win.offsetLeft;
            initialY = e.clientY - win.offsetTop;
        }
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentWindow) {
        e.preventDefault(); // Prevent text selection

        let x = e.clientX - initialX;
        let y = e.clientY - initialY;

        // Viewport Boundary Checks
        const winRect = currentWindow.getBoundingClientRect();
        const maxX = window.innerWidth - winRect.width;
        const maxY = window.innerHeight - winRect.height - 48; // Subtract taskbar height

        // Constrain X
        if (x < 0) x = 0;
        if (x > maxX) x = maxX;

        // Constrain Y
        if (y < 0) y = 0;
        if (y > maxY) y = maxY;

        currentWindow.style.left = `${x}px`;
        currentWindow.style.top = `${y}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    currentWindow = null;
});

// Start Menu
function toggleStartMenu(search = false) {
    const menu = document.getElementById('start-menu');
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'flex';
        zIndexCounter++;
        menu.style.zIndex = zIndexCounter + 100;

        if (search) {
            // Focus search input if we had one in start menu, 
            // but for now we just open it.
        }
    } else {
        menu.style.display = 'none';
    }
}

document.addEventListener('click', (e) => {
    const menu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.start-btn');
    const searchBtn = document.querySelector('.search-btn');

    if (menu.style.display === 'flex' &&
        !menu.contains(e.target) &&
        !startBtn.contains(e.target) &&
        !searchBtn.contains(e.target)) {
        menu.style.display = 'none';
    }
});

// Chrome App Logic
function switchChromeMode(mode) {
    const modeA = document.getElementById('chrome-mode-a');
    const modeB = document.getElementById('chrome-mode-b');
    const urlBar = document.getElementById('chrome-url');

    if (mode === 'newtab') {
        modeA.style.display = 'block';
        modeB.style.display = 'none';
        urlBar.value = 'New Tab';
    } else if (mode === 'projects') {
        modeA.style.display = 'none';
        modeB.style.display = 'block';
        urlBar.value = 'localhost:3000/projects.html';
        renderProjects();
    }
}

function handleGoogleSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value;
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
    }
}

function renderProjects() {
    const container = document.getElementById('projects-container');
    if (container.children.length > 0) return; // Already rendered

    projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.onclick = () => window.open(proj.link, '_blank');

        card.innerHTML = `
            <img src="${proj.img}" class="project-img pixelated" alt="${proj.title}">
            <h3 class="project-title">${proj.title}</h3>
            <p class="project-desc">${proj.desc}</p>
        `;

        container.appendChild(card);
    });
}

// File Explorer Logic
let currentPath = [];

function renderExplorer(pathName) {
    const view = document.getElementById('explorer-view');
    const pathInput = document.getElementById('explorer-path');
    view.innerHTML = '';
    pathInput.value = pathName;

    const items = fileSystem[pathName] || [];

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'explorer-item';
        el.ondblclick = () => handleExplorerItemClick(item);

        el.innerHTML = `
            <div class="explorer-icon pixelated" style="background-image: url('${item.icon}')"></div>
            <span class="explorer-label">${item.name}</span>
        `;

        view.appendChild(el);
    });
}

function handleExplorerItemClick(item) {
    if (item.type === 'drive' || item.type === 'folder') {
        renderExplorer(item.name);
    } else if (item.type === 'file') {
        if (item.app === 'notepad') {
            windowManager.open('notepad');
        } else if (item.app === 'chrome-projects') {
            windowManager.open('chrome', 'projects');
        }
    }
}

function explorerGoUp() {
    // Simple hardcoded back navigation for this depth
    const current = document.getElementById('explorer-path').value;
    if (current === 'About Me' || current === 'Projects') {
        renderExplorer('Local Disk (C:)');
    } else if (current === 'Local Disk (C:)') {
        renderExplorer('This PC');
    }
}
