// Camera module for Hùng's Photobooth

class CameraManager {
    constructor() {
        this.video = document.getElementById('camera-preview');
        this.canvas = document.getElementById('camera-canvas');
        this.overlay = document.getElementById('template-overlay');
        this.captureBtn = document.getElementById('capture-btn');
        this.autoCaptureBtn = document.getElementById('auto-capture-btn');
        this.switchCameraBtn = document.getElementById('switch-camera-btn');
        this.countdownDisplay = document.getElementById('countdown-display');
        this.countdownText = document.getElementById('countdown-text');
        
        // New elements for frame and layout selection
        this.frameOptions = document.querySelectorAll('.frame-option');
        this.layoutOptions = document.querySelectorAll('.layout-option');
        this.printBtn = document.getElementById('print-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        this.stream = null;
        this.cameras = [];
        this.currentCamera = 0;
        this.countdownActive = false;
        this.selectedFrame = 'none';
        this.selectedLayout = 'single';
        
        this.init();
    }
    
    async init() {
        // Initialize camera
        await this.setupCamera();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Hide loading screen and show main app
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    }
    
    async setupCamera() {
        try {
            // Get available cameras
            await this.enumerateCameras();
            
            // Start camera stream
            await this.startCamera();
        } catch (error) {
            console.error('Camera setup error:', error);
            showNotification('Could not access camera. Please check permissions.', 'error');
        }
    }
    
    async enumerateCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.cameras = devices.filter(device => device.kind === 'videoinput');
            console.log('Available cameras:', this.cameras);
        } catch (error) {
            console.error('Error enumerating cameras:', error);
        }
    }
    
    async startCamera(cameraIndex = 0) {
        try {
            // Stop existing stream if any
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            // Get camera constraints
            const constraints = this.getCameraConstraints(cameraIndex);
            
            // Start new stream
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            this.currentCamera = cameraIndex;
            
            // Play sound effect
            playSound('camera_on');
            
            // Show notification
            showNotification('Camera ready! 📸');
        } catch (error) {
            console.error('Error starting camera:', error);
            
            // Provide more specific error messages
            if (error.name === 'NotAllowedError') {
                showNotification('Camera access denied. Please allow camera permissions in your browser settings.', 'error');
            } else if (error.name === 'NotFoundError') {
                showNotification('No camera found. Please connect a camera to your device.', 'error');
            } else if (error.name === 'OverconstrainedError') {
                // Try again with more flexible constraints
                try {
                    const fallbackConstraints = {
                        video: { facingMode: 'user' },
                        audio: false
                    };
                    this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                    this.video.srcObject = this.stream;
                    this.currentCamera = cameraIndex;
                    showNotification('Camera ready with fallback settings! 📸', 'success');
                } catch (fallbackError) {
                    console.error('Fallback camera error:', fallbackError);
                    showNotification('Could not start camera. Please check permissions and ensure a camera is connected.', 'error');
                }
            } else {
                showNotification('Could not start camera. Please check permissions and ensure a camera is connected.', 'error');
            }
        }
    }
    
    getCameraConstraints(cameraIndex) {
        const qualitySelect = document.getElementById('quality-select');
        const quality = qualitySelect ? qualitySelect.value : '720p';
        
        let width, height;
        switch(quality) {
            case '720p':
                width = 1280;
                height = 720;
                break;
            case '1080p':
                width = 1920;
                height = 1080;
                break;
            default:
                width = 1280;
                height = 720;
        }
        
        const constraints = {
            video: {
                width: { ideal: width },
                height: { ideal: height },
                facingMode: 'user'
            },
            audio: false
        };
        
        // If we have multiple cameras, try to select the specified one
        // But don't require exact match to avoid OverconstrainedError
        if (this.cameras.length > cameraIndex) {
            constraints.video.deviceId = { ideal: this.cameras[cameraIndex].deviceId };
        }
        
        return constraints;
    }
    
    setupEventListeners() {
        // Capture button
        this.captureBtn.addEventListener('click', () => {
            this.capturePhoto();
        });
        
        // Auto capture button
        this.autoCaptureBtn.addEventListener('click', () => {
            this.startAutoCapture();
        });
        
        // Switch camera button
        this.switchCameraBtn.addEventListener('click', () => {
            this.switchCamera();
        });
        
        // Frame selection
        this.frameOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectFrame(option.dataset.frame);
            });
        });
        
        // Layout selection
        this.layoutOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectLayout(option.dataset.layout);
            });
        });
        
        // Print and reset buttons
        this.printBtn.addEventListener('click', () => {
            this.printPhoto();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.resetApp();
        });
        
        // Template selection
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.addEventListener('click', () => {
                this.selectTemplate(item.dataset.template);
            });
        });
    }
    
    capturePhoto() {
        if (this.countdownActive) return;
        
        // Play sound effect
        playSound('capture');
        
        // Capture the photo
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Show notification
        showNotification('Photo captured! 📸');
        
        // Return the captured image data
        return this.canvas.toDataURL('image/png');
    }
    
    async startAutoCapture() {
        if (this.countdownActive) return;
        
        this.countdownActive = true;
        
        // Get timer value
        const timerSelect = document.getElementById('timer-select');
        let countdownTime = 5;
        if (timerSelect) {
            countdownTime = parseInt(timerSelect.value);
        }
        
        // Show countdown display
        this.countdownDisplay.classList.remove('hidden');
        
        // Play sound effect
        playSound('countdown_start');
        
        // Countdown loop
        for (let i = countdownTime; i > 0; i--) {
            this.countdownText.textContent = i;
            this.countdownText.style.animation = 'countdownPulse 1s ease-in-out';
            
            // Play countdown sound
            playSound('countdown_tick');
            
            // Wait 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Capture photo
        this.countdownText.textContent = 'GO!';
        playSound('capture');
        
        // Capture the photo
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        const ctx = this.canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
        
        // Wait a moment to show "GO!" message
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Hide countdown display
        this.countdownDisplay.classList.add('hidden');
        this.countdownActive = false;
        
        // Show notification
        showNotification('Auto photo captured! 📸');
        
        // Switch to editor section
        this.switchToEditor();
        
        // Return the captured image data
        return this.canvas.toDataURL('image/png');
    }
    
    async switchCamera() {
        if (this.cameras.length <= 1) {
            showNotification('No other cameras available', 'info');
            return;
        }
        
        // Cycle to next camera
        const nextCameraIndex = (this.currentCamera + 1) % this.cameras.length;
        
        // Start new camera
        await this.startCamera(nextCameraIndex);
        
        // Show notification
        const cameraLabel = this.cameras[nextCameraIndex].label || `Camera ${nextCameraIndex + 1}`;
        showNotification(`Switched to ${cameraLabel}`, 'info');
    }
    
    selectTemplate(templateName) {
        // Remove active class from all templates
        const templateItems = document.querySelectorAll('.template-item');
        templateItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected template
        const selectedItem = document.querySelector(`.template-item[data-template="${templateName}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Update template overlay
        this.templateOverlay.className = 'template-overlay';
        if (templateName !== 'none') {
            this.templateOverlay.classList.add(templateName);
        }
        
        // Play sound effect
        playSound('template_select');
        
        // Show notification
        showNotification(`Template "${templateName}" selected! 🎨`, 'success');
    }
    
    switchToEditor() {
        // Hide camera section
        document.getElementById('camera-section').classList.remove('active');
        document.getElementById('camera-section').classList.add('hidden');
        
        // Show editor section
        document.getElementById('editor-section').classList.remove('hidden');
        document.getElementById('editor-section').classList.add('active');
        
        // Show notification
        showNotification('Switching to editor... ✨', 'info');
    }
}

// Initialize camera when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraManager = new CameraManager();
});

// Export CameraManager class
window.CameraManager = CameraManager;
