// Camera module for Hùng's Photobooth

class CameraManager {
  constructor() {
    this.video = document.getElementById("camera-preview");
    this.step1Video = document.getElementById("step1-camera-preview");
    this.canvas = document.getElementById("camera-canvas");
    this.overlay = document.getElementById("template-overlay");
    this.captureBtn = document.getElementById("capture-btn");
    this.autoCaptureBtn = document.getElementById("auto-capture-btn");
    this.switchCameraBtn = document.getElementById("switch-camera-btn");
    this.countdownDisplay = document.getElementById("countdown-display");
    this.countdownText = document.getElementById("countdown-text");
    
    // Frame and layout selection elements
    this.frameOptions = document.querySelectorAll(".frame-option");
    this.layoutOptions = document.querySelectorAll(".layout-option");
    this.filterButtons = document.querySelectorAll(".filter-btn");
    this.skinSmoothingSlider = document.getElementById("skin-smoothing-slider");

    this.stream = null;
    this.cameras = [];
    this.currentCamera = 0;
    this.countdownActive = false;
    this.selectedFrame = "none";
    this.selectedLayout = "single";
    this.selectedFilter = "none";

    this.init();
  }

  async init() {
    // Initialize camera
    await this.setupCamera();

    // Setup event listeners
    this.setupEventListeners();

    // Hide loading screen and show main app
    document.getElementById("loading-screen").classList.add("hidden");
    document.getElementById("main-app").classList.remove("hidden");
  }

  async setupCamera() {
    try {
      // Get available cameras
      await this.enumerateCameras();

      // Start camera stream
      await this.startCamera();
    } catch (error) {
      console.error("Camera setup error:", error);
      showNotification(
        "Could not access camera. Please check permissions.",
        "error"
      );
    }
  }

  async enumerateCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter((device) => device.kind === "videoinput");
      console.log("Available cameras:", this.cameras);
    } catch (error) {
      console.error("Error enumerating cameras:", error);
    }
  }

  async startCamera(cameraIndex = 0) {
    try {
      // Stop existing stream if any
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      // Get camera constraints
      const constraints = this.getCameraConstraints(cameraIndex);

      // Start new stream
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = this.stream;
      if (this.step1Video) {
        this.step1Video.srcObject = this.stream;
      }
      this.currentCamera = cameraIndex;

      // Play sound effect
      playSound("camera_on");

      // Show notification
      showNotification("Camera ready! 📸");
    } catch (error) {
      console.error("Error starting camera:", error);

      // Provide more specific error messages
      if (error.name === "NotAllowedError") {
        showNotification(
          "Camera access denied. Please allow camera permissions in your browser settings.",
          "error"
        );
      } else if (error.name === "NotFoundError") {
        showNotification(
          "No camera found. Please connect a camera to your device.",
          "error"
        );
      } else if (error.name === "OverconstrainedError") {
        // Try again with more flexible constraints
        try {
          const fallbackConstraints = {
            video: { facingMode: "user" },
            audio: false,
          };
          this.stream =
            await navigator.mediaDevices.getUserMedia(fallbackConstraints);
          this.video.srcObject = this.stream;
          this.currentCamera = cameraIndex;
          showNotification(
            "Camera ready with fallback settings! 📸",
            "success"
          );
        } catch (fallbackError) {
          console.error("Fallback camera error:", fallbackError);
          showNotification(
            "Could not start camera. Please check permissions and ensure a camera is connected.",
            "error"
          );
        }
      } else {
        showNotification(
          "Could not start camera. Please check permissions and ensure a camera is connected.",
          "error"
        );
      }
    }
  }

  getCameraConstraints(cameraIndex) {
    const qualitySelect = document.getElementById("quality-select");
    const quality = qualitySelect ? qualitySelect.value : "720p";

    let width, height;
    switch (quality) {
      case "720p":
        width = 1280;
        height = 720;
        break;
      case "1080p":
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
        facingMode: "user",
      },
      audio: false,
    };

    // If we have multiple cameras, try to select the specified one
    // But don't require exact match to avoid OverconstrainedError
    if (this.cameras.length > cameraIndex) {
      constraints.video.deviceId = {
        ideal: this.cameras[cameraIndex].deviceId,
      };
    }

    return constraints;
  }

  setupEventListeners() {
    // Capture button
    this.captureBtn.addEventListener("click", () => {
      this.capturePhoto();
    });

    // Auto capture button
    this.autoCaptureBtn.addEventListener("click", () => {
      this.startAutoCapture();
    });

    // Switch camera button
    this.switchCameraBtn.addEventListener("click", () => {
      this.switchCamera();
    });

    // Frame selection
    this.frameOptions.forEach((option) => {
      option.addEventListener("click", () => {
        this.selectFrame(option.dataset.frame);
      });
    });

    // Style selection buttons
    const styleButtons = document.querySelectorAll(".style-btn");
    styleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const style = button.dataset.style;
        this.selectStyle(style);
        
        // Update active button
        styleButtons.forEach((btn) => {
          btn.classList.remove("active");
        });
        button.classList.add("active");
      });
    });

    // Layout selection
    this.layoutOptions.forEach((option) => {
      option.addEventListener("click", () => {
        this.selectLayout(option.dataset.layout);
      });
    });

    // Filter selection
    this.filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectFilter(btn.dataset.template);
      });
    });

    // Step 1 Filter selection
    const step1FilterButtons = document.querySelectorAll(".step1-content .filter-btn");
    step1FilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectStep1Filter(btn.dataset.filter);
      });
    });

    // Skin smoothing slider
    if (this.skinSmoothingSlider) {
      this.skinSmoothingSlider.addEventListener("input", () => {
        this.applySkinSmoothing();
      });
    }

    // Template selection
    const templateItems = document.querySelectorAll(".template-item");
    templateItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.selectTemplate(item.dataset.template);
      });
    });

    // Print and reset buttons
    this.printBtn.addEventListener("click", () => {
      this.printPhoto();
    });

    this.resetBtn.addEventListener("click", () => {
      this.resetApp();
    });

    // Frame selection button
    if (this.selectFrameBtn) {
      this.selectFrameBtn.addEventListener("click", () => {
        this.frameSelectionContainer.classList.toggle("hidden");
      });
    }

    // Upload frame option event listener
    const uploadFrameOption = document.querySelector(".frame-option.upload-frame");
    const customFrameUpload = document.getElementById("custom-frame-upload");
    
    if (uploadFrameOption && customFrameUpload) {
      uploadFrameOption.addEventListener("click", () => {
        customFrameUpload.click();
      });

      customFrameUpload.addEventListener("change", (event) => {
        this.handleCustomFrameUpload(event);
      });
    }
  }

  capturePhoto() {
    if (this.countdownActive) return;

    // Play sound effect
    playSound("capture");

    // Capture the photo
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    // Show notification
    showNotification("Photo captured! 📸");

    // Switch to editor section
    this.switchToEditor();

    // Return the captured image data
    return this.canvas.toDataURL("image/png");
  }

  async startAutoCapture() {
    if (this.countdownActive) return;

    this.countdownActive = true;

    // Get timer value
    const timerSelect = document.getElementById("timer-select");
    let countdownTime = 5;
    if (timerSelect) {
      countdownTime = parseInt(timerSelect.value);
    }

    // Show countdown display
    this.countdownDisplay.classList.remove("hidden");

    // Play sound effect
    playSound("countdown_start");

    // Countdown loop
    for (let i = countdownTime; i > 0; i--) {
      this.countdownText.textContent = i;
      this.countdownText.style.animation = "countdownPulse 1s ease-in-out";

      // Play countdown sound
      playSound("countdown_tick");

      // Wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Capture photo
    this.countdownText.textContent = "GO!";
    playSound("capture");

    // Capture the photo
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    const ctx = this.canvas.getContext("2d");
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    // Wait a moment to show "GO!" message
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Hide countdown display
    this.countdownDisplay.classList.add("hidden");
    this.countdownActive = false;

    // Show notification
    showNotification("Auto photo captured! 📸");

    // Switch to editor section
    this.switchToEditor();

    // Return the captured image data
    return this.canvas.toDataURL("image/png");
  }

  async switchCamera() {
    if (this.cameras.length <= 1) {
      showNotification("No other cameras available", "info");
      return;
    }

    // Cycle to next camera
    const nextCameraIndex = (this.currentCamera + 1) % this.cameras.length;

    // Start new camera
    await this.startCamera(nextCameraIndex);

    // Show notification
    const cameraLabel =
      this.cameras[nextCameraIndex].label || `Camera ${nextCameraIndex + 1}`;
    showNotification(`Switched to ${cameraLabel}`, "info");
  }

  selectTemplate(templateName) {
    // Remove active class from all templates
    const templateItems = document.querySelectorAll(".template-item");
    templateItems.forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to selected template
    const selectedItem = document.querySelector(
      `.template-item[data-template="${templateName}"]`
    );
    if (selectedItem) {
      selectedItem.classList.add("active");
    }

    // Update template overlay
    this.templateOverlay.className = "template-overlay";
    if (templateName !== "none") {
      this.templateOverlay.classList.add(templateName);
    }

    // Play sound effect
    playSound("template_select");

    // Show notification
    showNotification(`Template "${templateName}" selected! 🎨`, "success");
  }

  switchToEditor() {
    // Hide camera section
    document.getElementById("camera-section").classList.remove("active");
    document.getElementById("camera-section").classList.add("hidden");

    // Show editor section
    document.getElementById("editor-section").classList.remove("hidden");
    document.getElementById("editor-section").classList.add("active");

    // Show notification
    showNotification("Switching to editor... ✨", "info");
  }

  selectFrame(frameType) {
    // Update UI
    this.frameOptions.forEach((option) => {
      option.classList.remove("active");
    });

    const selectedOption = document.querySelector(`.frame-option[data-frame="${frameType}"]`);
    if (selectedOption) {
      selectedOption.classList.add("active");
    }

    this.selectedFrame = frameType;

    // Apply frame to overlay
    this.overlay.className = "template-overlay";
    if (frameType !== "none") {
      this.overlay.classList.add(`${frameType}-frame`);
    }

    playSound("select");
    showNotification(`Frame "${frameType}" selected!`, "success");
  }

  selectLayout(layoutType) {
    // Update UI
    this.layoutOptions.forEach((option) => {
      option.classList.remove("active");
    });

    const selectedOption = document.querySelector(`.layout-option[data-layout="${layoutType}"]`);
    if (selectedOption) {
      selectedOption.classList.add("active");
    }

    this.selectedLayout = layoutType;

    playSound("select");
    showNotification(`Layout "${layoutType}" selected!`, "success");
  }

  selectFilter(filterName) {
    // Update UI
    this.filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const selectedButton = document.querySelector(`.filter-btn[data-template="${filterName}"]`);
    if (selectedButton) {
      selectedButton.classList.add("active");
    }

    this.selectedFilter = filterName;

    playSound("select");
    showNotification(`Filter "${filterName}" selected!`, "success");
  }

  selectStep1Filter(filterName) {
    // Update UI for Step 1 filter buttons
    const step1FilterButtons = document.querySelectorAll(".step1-content .filter-btn");
    step1FilterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    const selectedButton = document.querySelector(`.step1-content .filter-btn[data-filter="${filterName}"]`);
    if (selectedButton) {
      selectedButton.classList.add("active");
    }

    // Apply filter to Step 1 camera preview
    if (this.step1Video) {
      // Remove all filter classes
      this.step1Video.classList.remove("koreanBeauty", "retro", "minimal", "softGlamour", "cute");
      
      // Add selected filter class if not "none"
      if (filterName !== "none") {
        this.step1Video.classList.add(filterName);
      }
    }

    playSound("select");
    showNotification(`Filter "${filterName}" selected!`, "success");
  }

  selectStyle(styleName) {
    this.currentStyle = styleName;
    playSound("select");
    // No notification or camera preview effect for style selection
  }

  handleCustomFrameUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is a PNG
    if (!file.name.toLowerCase().endsWith('.png')) {
      showNotification('Please select a PNG file!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Store the uploaded frame data
      this.customFrameData = e.target.result;
      
      // Select the custom frame
      this.selectFrame('custom');
      
      // Update UI to show custom frame as active
      const frameOptions = document.querySelectorAll('.frame-option');
      frameOptions.forEach((option) => {
        option.classList.remove('active');
      });
      
      const customFrameOption = document.querySelector('.frame-option.upload-frame');
      if (customFrameOption) {
        customFrameOption.classList.add('active');
      }
      
      playSound('select');
      showNotification('Custom frame uploaded successfully!', 'success');
    };
    
    reader.readAsDataURL(file);
  }

  applySkinSmoothing() {
    // Apply skin smoothing effect to the captured photo
    if (window.photoEditor && window.photoEditor.currentPhoto) {
      const photo = window.photoEditor.currentPhoto;

      // Convert value to blur intensity (0-100% mapped to 0-0.5 blur)
      const blurIntensity = (this.skinSmoothingSlider.value / 100) * 0.5;

      // Remove any existing blur filters
      const filters = photo.filters || [];
      const blurFilterIndex = filters.findIndex((filter) => filter.type === "Blur");

      if (blurFilterIndex !== -1) {
        filters.splice(blurFilterIndex, 1);
      }

      // Add blur filter if intensity > 0
      if (blurIntensity > 0) {
        const blurFilter = new fabric.Image.filters.Blur({
          blur: blurIntensity,
        });
        filters.push(blurFilter);
      }

      photo.filters = filters;
      photo.applyFilters();
      window.photoEditor.canvas.renderAll();
    }

    // Store the value for potential use in image processing
    this.skinSmoothingValue = this.skinSmoothingSlider.value;

    // Show notification with the actual value
    showNotification(`Skin smoothing set to ${this.skinSmoothingSlider.value}% 🧴`, "info");

    // Play sound effect
    playSound("adjust");
  }

  openFrameSelection() {
    // Switch to editor section to show frame options
    this.switchToEditor();

    // Play sound effect
    playSound("click");
  }

  printPhoto() {
    // In a real implementation, we would integrate with a printing service
    // For now, we'll show a notification
    showNotification('Printing feature coming soon! 🖨️', 'info');
    playSound('print');
  }

  resetApp() {
    // Reset the application to initial state
    showNotification('App reset! Starting over 🔄', 'info');
    playSound('reset');
    
    // Hide camera section and show step 1
    document.getElementById('camera-section').classList.add('hidden');
    document.getElementById('step-1').classList.remove('hidden');
    
    // Reset to step 1 in the main app
    if (window.photoboothApp) {
      window.photoboothApp.showStep(1);
    }
    
    // Reset camera
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Clear canvas
    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Reset UI elements
    this.countdownDisplay.classList.add('hidden');
    this.overlay.classList.add('hidden');
    
    // Reset photo count and layout selections
    this.photoCount = 4;
    this.selectedLayout = 'classic';
    
    // Update UI buttons to reflect reset selections
    document.querySelectorAll('.count-btn').forEach(btn => {
      if (btn.dataset.count === '4') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    document.querySelectorAll('.layout-btn').forEach(btn => {
      if (btn.dataset.layout === 'classic') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

// Initialize camera when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.cameraManager = new CameraManager();
});

// Export CameraManager class
window.CameraManager = CameraManager;
