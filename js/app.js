// Main App Controller for Hùng's Photobooth

class PhotoboothApp {
    constructor() {
        this.cameraManager = null;
        this.photoEditor = null;
        this.templateManager = null;
        this.filterManager = null;
        
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.mainApp = document.getElementById('main-app');
        this.startBtn = document.getElementById('start-btn');
        
        this.settingsBtn = document.getElementById('settings-btn');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.settingsModal = document.getElementById('settings-modal');
        
        this.init();
    }
    
    init() {
        console.log('Hùng\'s Photobooth App initialized! 📸');
        
        // Initialize managers
        this.initializeManagers();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create animated background elements
        this.createAnimatedBackground();
        
        // Show welcome screen by default
        this.showWelcomeScreen();
    }
    
    setupEventListeners() {
        // Start button
        this.startBtn.addEventListener('click', () => {
            this.startApp();
        });
        
        // Settings button
        this.settingsBtn.addEventListener('click', () => {
            this.settingsModal.style.display = 'block';
        });
        
        // Close settings modal
        this.closeSettingsBtn.addEventListener('click', () => {
            this.settingsModal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.settingsModal.classList.contains('hidden')) {
                this.closeSettings();
            }
        });
    }
    
    initializeManagers() {
        // These managers are already initialized in their respective files
        // We just need to make sure they exist
        if (window.CameraManager) {
            // Camera manager is initialized in camera.js
        }
        
        if (window.PhotoEditor) {
            // Photo editor is initialized in editor.js
        }
        
        if (window.TemplateManager) {
            this.templateManager = window.templateManager;
        }
        
        if (window.FilterManager) {
            this.filterManager = window.filterManager;
        }
    }
    
    showWelcomeScreen() {
        this.welcomeScreen.classList.remove('hidden');
        this.mainApp.classList.add('hidden');
    }
    
    startApp() {
        this.welcomeScreen.classList.add('hidden');
        this.mainApp.classList.remove('hidden');
        
        // Start camera if not already started
        if (window.cameraManager && !window.cameraManager.stream) {
            window.cameraManager.startCamera();
        }
        
        playSound('settings_open');
        showNotification('Chào mừng bạn đến với Hùng\'s Photobooth! 📸', 'success');
    }
    
    openSettings() {
        this.settingsModal.classList.remove('hidden');
        playSound('settings_open');
    }
    
    closeSettings() {
        this.settingsModal.classList.add('hidden');
        playSound('settings_close');
    }
    
    // Create animated background elements
    createAnimatedBackground() {
        // Create sparkles
        for (let i = 0; i < 5; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'bird';
            sparkle.innerHTML = '✨';
            sparkle.style.left = `${-50 - (i * 30)}px`;
            sparkle.style.top = `${Math.random() * 30 + 10}%`;
            sparkle.style.animationDelay = `${Math.random() * 5}s`;
            this.welcomeScreen.appendChild(sparkle);
        }
        
        // Create more blink effects
        for (let i = 0; i < 15; i++) {
            const blink = document.createElement('div');
            blink.className = 'blink';
            blink.innerHTML = '✨';
            blink.style.top = `${Math.random() * 100}%`;
            blink.style.left = `${Math.random() * 100}%`;
            blink.style.animationDelay = `${Math.random() * 2}s`;
            this.welcomeScreen.appendChild(blink);
        }
        
        // Create cute animated stickers
        const stickers = ['💕', '💖', '🎈', '🎀', '🎁', '🍓', '🍒', '🍑', '🍦', '🍭'];
        for (let i = 0; i < 10; i++) {
            const sticker = document.createElement('div');
            sticker.className = 'sticker';
            sticker.innerHTML = stickers[Math.floor(Math.random() * stickers.length)];
            sticker.style.top = `${Math.random() * 100}%`;
            sticker.style.left = `${Math.random() * 100}%`;
            sticker.style.animationDelay = `${Math.random() * 3}s`;
            // Make stickers larger (30-50px instead of 15-35px)
            sticker.style.fontSize = `${Math.random() * 20 + 30}px`;
            sticker.style.cursor = 'pointer';
            sticker.draggable = true;
            
            // Add interactivity
            sticker.addEventListener('mouseenter', () => {
                sticker.style.transform = 'scale(1.2)';
                sticker.style.transition = 'transform 0.2s ease';
            });
            
            sticker.addEventListener('mouseleave', () => {
                sticker.style.transform = 'scale(1)';
                sticker.style.transition = 'transform 0.2s ease';
            });
            
            // Add drag functionality
            let isDragging = false;
            let offsetX, offsetY;
            
            sticker.addEventListener('mousedown', (e) => {
                isDragging = true;
                offsetX = e.clientX - sticker.getBoundingClientRect().left;
                offsetY = e.clientY - sticker.getBoundingClientRect().top;
                sticker.style.zIndex = '100';
                sticker.style.cursor = 'grabbing';
            });
            
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    sticker.style.left = `${e.clientX - offsetX}px`;
                    sticker.style.top = `${e.clientY - offsetY}px`;
                }
            });
            
            document.addEventListener('mouseup', () => {
                isDragging = false;
                sticker.style.cursor = 'pointer';
                sticker.style.zIndex = '0';
            });
            
            this.welcomeScreen.appendChild(sticker);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.photoboothApp = new PhotoboothApp();
});

// Export PhotoboothApp class
window.PhotoboothApp = PhotoboothApp;
