// Main App Controller for Hùng's Photobooth

class PhotoboothApp {
  constructor() {
    this.cameraManager = null;
    this.photoEditor = null;
    this.templateManager = null;
    this.filterManager = null;

    this.welcomeScreen = document.getElementById("welcome-screen");
    this.mainApp = document.getElementById("main-app");
    this.startBtn = document.getElementById("start-btn");

    this.settingsBtn = document.getElementById("settings-btn");
    this.homeBtn = document.getElementById("home-btn");
    this.closeSettingsBtn = document.getElementById("close-settings");
    this.settingsModal = document.getElementById("settings-modal");

    // Step timeline elements
    this.currentStep = 1;
    this.stepTimeline = document.getElementById("step-timeline");
    this.stepSections = document.querySelectorAll(".step-section");
    
    // Step 1 elements
    this.photoCount = 4;
    this.selectedLayout = "classic";
    this.countBtns = document.querySelectorAll(".count-btn");
    this.layoutBtns = document.querySelectorAll(".layout-btn");
    this.startCaptureBtn = document.getElementById("start-capture-btn");

    this.init();
  }

  init() {
    console.log("Hùng's Photobooth App initialized! 📸");

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
    this.startBtn.addEventListener("click", () => {
      this.startApp();
    });

    // Settings button
    this.settingsBtn.addEventListener("click", () => {
      this.settingsModal.style.display = "block";
    });

    // Close settings modal
    this.closeSettingsBtn.addEventListener("click", () => {
      this.settingsModal.style.display = "none";
    });

    // Home button - return to welcome screen
    this.homeBtn.addEventListener("click", () => {
      this.mainApp.classList.add("hidden");
      this.welcomeScreen.classList.remove("hidden");
      playSound("settings_close");
      showNotification("Trở về màn hình chính 🏠", "info");
    });

    // Step 1: Photo count selection
    this.countBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.countBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.photoCount = parseInt(btn.dataset.count);
        playSound("button_click");
      });
    });

    // Step 1: Layout selection
    this.layoutBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.layoutBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.selectedLayout = btn.dataset.layout;
        playSound("button_click");
      });
    });

    // Step 1: Start capture button - Now handled by Step1Manager
    // Removed conflicting event listener to prevent duplicate capture flows

    // Close modal when clicking outside
    this.settingsModal.addEventListener("click", (e) => {
      if (e.target === this.settingsModal) {
        this.closeSettings();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        !this.settingsModal.classList.contains("hidden")
      ) {
        this.closeSettings();
      }
    });
  }

  initializeManagers() {
    // Initialize camera manager
    if (window.CameraManager) {
      this.cameraManager = new CameraManager();
      window.cameraManager = this.cameraManager;
    }

    // Initialize photo editor
    if (window.PhotoEditor) {
      // Photo editor is initialized in editor.js
    }

    // Initialize template manager
    if (window.TemplateManager) {
      this.templateManager = window.templateManager;
    }

    // Initialize filter manager
    if (window.FilterManager) {
      this.filterManager = window.filterManager;
    }

    // Initialize Step 1 manager
    if (window.Step1Manager) {
      this.step1Manager = window.step1Manager;
    }
  }

  showWelcomeScreen() {
    this.welcomeScreen.classList.remove("hidden");
    this.mainApp.classList.add("hidden");
  }

  startApp() {
    this.welcomeScreen.classList.add("hidden");
    this.mainApp.classList.remove("hidden");

    // Show step 1 and initialize timeline
    this.showStep(1);

    playSound("settings_open");
    showNotification("Chào mừng bạn đến với Hùng's Photobooth! 📸", "success");
  }

  showStep(stepNumber) {
    // Update current step
    this.currentStep = stepNumber;

    // Update timeline visual state
    this.updateTimeline();

    // Show/hide appropriate step sections
    this.stepSections.forEach((section, index) => {
      if (index + 1 === stepNumber) {
        section.classList.add("active");
        section.classList.remove("hidden");
      } else {
        section.classList.remove("active");
        section.classList.add("hidden");
      }
    });

    // Handle step-specific logic
    if (stepNumber === 1) {
      // Ensure camera is started for Step 1 preview
      if (this.cameraManager && !this.cameraManager.stream) {
        this.cameraManager.setupCamera();
      }
    }
  }

  updateTimeline() {
    const stepItems = document.querySelectorAll(".step-item");
    
    stepItems.forEach((item, index) => {
      const stepNum = index + 1;
      
      // Remove all states
      item.classList.remove("active", "completed");
      
      // Add appropriate state
      if (stepNum < this.currentStep) {
        item.classList.add("completed");
      } else if (stepNum === this.currentStep) {
        item.classList.add("active");
      }
    });
  }

  // Method for Step 1 manager to navigate to next step
  goToStep(stepNumber) {
    this.showStep(stepNumber);
    
    // Play transition sound
    playSound("settings_open");
    
    // Show appropriate notification
    const stepNames = {
      1: "Chụp ảnh",
      2: "Chỉnh sửa", 
      3: "Lưu & Chia sẻ"
    };
    
    if (stepNames[stepNumber]) {
      showNotification(`Chuyển đến bước ${stepNumber}: ${stepNames[stepNumber]}`, "success");
    }
  }

  // Removed startPhotoCapture() method - now handled by Step1Manager
  // This prevents conflicts between old and new capture flows

  openSettings() {
    this.settingsModal.classList.remove("hidden");
    playSound("settings_open");
  }

  closeSettings() {
    this.settingsModal.classList.add("hidden");
    playSound("settings_close");
  }

  // Create animated background elements
  createAnimatedBackground() {
    // Create sparkles
    for (let i = 0; i < 5; i++) {
      const sparkle = document.createElement("div");
      sparkle.className = "bird";
      sparkle.innerHTML = "✨";
      sparkle.style.left = `${-50 - i * 30}px`;
      sparkle.style.top = `${Math.random() * 30 + 10}%`;
      sparkle.style.animationDelay = `${Math.random() * 5}s`;
      this.welcomeScreen.appendChild(sparkle);
    }

    // Create more blink effects
    for (let i = 0; i < 15; i++) {
      const blink = document.createElement("div");
      blink.className = "blink";
      blink.innerHTML = "✨";
      blink.style.top = `${Math.random() * 100}%`;
      blink.style.left = `${Math.random() * 100}%`;
      blink.style.animationDelay = `${Math.random() * 2}s`;
      this.welcomeScreen.appendChild(blink);
    }

    // Create cute animated stickers
    const stickers = [
      "💕",
      "💖",
      "🎈",
      "🎀",
      "🎁",
      "🍓",
      "🍒",
      "🍑",
      "🍦",
      "🍭",
    ];
    for (let i = 0; i < 10; i++) {
      const sticker = document.createElement("div");
      sticker.className = "sticker";
      sticker.innerHTML = stickers[Math.floor(Math.random() * stickers.length)];
      sticker.style.top = `${Math.random() * 100}%`;
      sticker.style.left = `${Math.random() * 100}%`;
      sticker.style.animationDelay = `${Math.random() * 3}s`;
      // Make stickers larger (30-50px instead of 15-35px)
      sticker.style.fontSize = `${Math.random() * 20 + 30}px`;
      sticker.style.cursor = "pointer";
      sticker.draggable = true;

      // Add interactivity
      sticker.addEventListener("mouseenter", () => {
        sticker.style.transform = "scale(1.2)";
        sticker.style.transition = "transform 0.2s ease";
      });

      sticker.addEventListener("mouseleave", () => {
        sticker.style.transform = "scale(1)";
        sticker.style.transition = "transform 0.2s ease";
      });

      // Add drag functionality
      let isDragging = false;
      let offsetX, offsetY;

      sticker.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - sticker.getBoundingClientRect().left;
        offsetY = e.clientY - sticker.getBoundingClientRect().top;
        sticker.style.zIndex = "100";
        sticker.style.cursor = "grabbing";
      });

      document.addEventListener("mousemove", (e) => {
        if (isDragging) {
          sticker.style.left = `${e.clientX - offsetX}px`;
          sticker.style.top = `${e.clientY - offsetY}px`;
        }
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
        sticker.style.cursor = "pointer";
        sticker.style.zIndex = "0";
      });

      this.welcomeScreen.appendChild(sticker);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.photoboothApp = new PhotoboothApp();
  window.app = window.photoboothApp; // Make it accessible as window.app for Step 1 manager
});

// Export PhotoboothApp class
window.PhotoboothApp = PhotoboothApp;
