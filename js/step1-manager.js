// Step 1 Manager for Hùng's Photobooth

class Step1Manager {
  constructor() {
    // Initialize properties
    this.photoCount = 1;
    this.captureDelay = 3; // Default 3 seconds
    this.selectedFrame = "none";
    this.selectedStyle = "none";
    this.skinTone = 0;
    this.customFrameImage = null;
    this.capturedPhotos = [];
    this.isCapturing = false;
    this.countdownTimer = null;

    // Hardcoded PNG frames for "Khung ảnh" (Frame selection)
    this.frameAssets = {
      none: null,
      vn: "assets/frames/basic/Vn_80.png",
      rounded: "assets/frames/basic/vnpt_80_nam.png",
      heart: "assets/frames/basic/heart.png",
      circle: "assets/frames/basic/circle.png",
      vintage: "assets/frames/basic/vintage.png",
      kawaii: "assets/frames/korean/kawaii.png",
      pastel: "assets/frames/korean/pastel.png",
      vn: "assets/frames/basic/Vn_80.png",
      "cherry-blossom": "assets/frames/korean/cherry-blossom.png",
      "cute-border": "assets/frames/korean/cute-border.png",
      "korean-traditional": "assets/frames/korean/korean-traditional.png",
    };

    // Hardcoded PNG frames for "Phong cách chụp ảnh" (Photo styles with frame overlays)
    this.styleFrameAssets = {
      none: null,
      vintage: "assets/frames/effects/vintage-overlay.png",
      retro: "assets/frames/effects/retro-overlay.png",
      minimal: null, // No frame overlay for minimal style
      bright: "assets/frames/effects/bright-overlay.png",
      dreamy: "assets/frames/effects/dreamy-overlay.png",
      kawaii: "assets/frames/effects/kawaii-overlay.png",
      pastel: "assets/frames/effects/pastel-overlay.png",
      film: "assets/frames/effects/film-strip.png",
    };

    // Get DOM elements
    this.photoCountDropdown = document.getElementById("photo-count-dropdown");
    this.delayDropdown = document.getElementById("delay-dropdown");
    this.frameDropdown = document.getElementById("frame-dropdown");
    this.customFrameUpload = document.getElementById("custom-frame-upload");
    this.uploadFrameBtn = document.getElementById("upload-frame-btn");
    this.skinToneSlider = document.getElementById("skin-tone-slider");
    this.skinToneValue = document.getElementById("skin-tone-value");
    this.startCaptureBtn = document.getElementById("start-capture-btn");
    this.video = document.getElementById("step1-camera-preview");
    this.canvas = document.getElementById("step1-camera-canvas");
    this.frameOverlay = document.getElementById("step1-frame-overlay");
    this.countdownOverlay = document.getElementById("step1-countdown-overlay");
    this.countdownNumber = this.countdownOverlay ? this.countdownOverlay.querySelector('.countdown-number') : null;
    this.capturedPhotosContainer = document.querySelector(
      ".captured-photos-container"
    );
    this.styleButtons = document.querySelectorAll(".style-btn");
    this.switchCameraBtn = document.getElementById("switch-camera-btn");
    this.retakePhotosBtn = document.getElementById("retake-photos-btn");
    this.continueToEditBtn = document.getElementById("continue-to-edit-btn");

    // Camera elements
    this.video = document.getElementById("step1-camera-preview");
    this.canvas = document.getElementById("step1-camera-canvas");
    this.overlay = document.getElementById("step1-template-overlay");
    this.frameOverlay = document.getElementById("step1-frame-overlay");
    this.capturedPhotosGrid = document.getElementById("captured-photos-grid");
    this.photoActions = document.getElementById("photo-actions");

    this.init();
  }

  init() {
    // Set up event listeners
    this.setupEventListeners();
    
    // Create posing assets directory structure
    this.createPosingAssets();
    this.updateSkinToneValue();
    this.applyStyleToPreview();
  }

  setupEventListeners() {
    // Photo count dropdown
    this.photoCountDropdown.addEventListener("change", (e) => {
      this.photoCount = parseInt(e.target.value);
      console.log(`Photo count changed to: ${this.photoCount}`);
      this.clearCapturedPhotos();
    });

    // Capture delay dropdown
    this.delayDropdown.addEventListener("change", (e) => {
      this.captureDelay = parseInt(e.target.value);
      console.log(`Capture delay changed to: ${this.captureDelay} seconds`);
    });

    // Frame dropdown
    this.frameDropdown.addEventListener("change", (e) => {
      this.selectedFrame = e.target.value;
      this.handleFrameSelection();
    });

    // Custom frame upload
    this.uploadFrameBtn.addEventListener("click", () => {
      this.customFrameUpload.click();
    });

    this.customFrameUpload.addEventListener("change", (e) => {
      this.handleCustomFrameUpload(e);
    });

    // Style buttons
    this.styleButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.selectStyle(e.target.closest(".style-btn"));
      });
    });

    // Skin tone slider (now skin smoothing)
    this.skinToneSlider.addEventListener("input", (e) => {
      this.skinTone = parseInt(e.target.value);
      this.updateSkinToneValue();
      this.applySkinSmoothingToPreview();
    });

    // Start capture button
    this.startCaptureBtn.addEventListener("click", () => {
      this.startPhotoCapture();
    });

    // Simple posing interactions
    document.querySelectorAll('.pose-item').forEach((item) => {
      item.addEventListener('click', () => {
        this.selectPosingIdea(item);
      });
    });

    // Switch camera button
    this.switchCameraBtn.addEventListener("click", () => {
      if (window.cameraManager) {
        window.cameraManager.switchCamera();
      }
    });

    // Retake photos button
    this.retakePhotosBtn.addEventListener("click", () => {
      this.retakePhotos();
    });

    // Continue to edit button
    this.continueToEditBtn.addEventListener("click", () => {
      this.continueToEdit();
    });
  }

  handleFrameSelection() {
    if (this.selectedFrame === "custom") {
      this.uploadFrameBtn.classList.remove("hidden");
    } else {
      this.uploadFrameBtn.classList.add("hidden");
      this.applyFrameToPreview();
    }
  }

  async handleCustomFrameUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      this.customFrameImage = imageUrl;
      this.applyFrameToPreview();

      // Show success message
      this.showNotification("Khung ảnh đã được tải lên thành công!", "success");
    } catch (error) {
      console.error("Error uploading custom frame:", error);
      this.showNotification("Lỗi khi tải lên khung ảnh!", "error");
    }
  }

  selectStyle(button) {
    // Remove active class from all buttons
    this.styleButtons.forEach((btn) => btn.classList.remove("active"));

    // Add active class to selected button
    button.classList.add("active");

    // Update selected style
    this.selectedStyle = button.dataset.style;

    // Apply style to preview
    this.applyStyleToPreview();
    this.applySkinSmoothingToPreview();
  }

  updateSkinToneValue() {
    this.skinToneValue.textContent = this.skinTone;
    // Update label to reflect skin smoothing
    const label = document.querySelector(".skin-tone-selection label");
    if (label) {
      label.innerHTML = "🌸 Làm mịn da:";
    }
  }

  applyStyleToPreview() {
    if (!this.video) return;

    // Apply CSS filters based on selected style
    let filters = [];

    // Style-specific filters
    switch (this.selectedStyle) {
      case "vintage":
        filters.push(
          "sepia(0.3)",
          "contrast(1.1)",
          "saturate(0.9)",
          "brightness(1.05)"
        );
        break;
      case "retro":
        filters.push(
          "sepia(0.5)",
          "contrast(1.2)",
          "hue-rotate(15deg)",
          "saturate(1.1)"
        );
        break;
      case "minimal":
        filters.push("grayscale(1)", "contrast(1.1)", "brightness(1.05)");
        break;
      case "bright":
        filters.push("brightness(1.3)", "contrast(1.15)", "saturate(1.3)");
        break;
      case "dreamy":
        filters.push(
          "brightness(1.15)",
          "blur(0.8px)",
          "saturate(1.4)",
          "contrast(0.95)"
        );
        break;
      case "kawaii":
        filters.push(
          "brightness(1.2)",
          "saturate(1.5)",
          "contrast(1.1)",
          "hue-rotate(10deg)"
        );
        break;
      case "pastel":
        filters.push(
          "brightness(1.1)",
          "saturate(0.8)",
          "contrast(0.9)",
          "hue-rotate(-5deg)"
        );
        break;
      case "film":
        filters.push(
          "sepia(0.2)",
          "contrast(1.3)",
          "saturate(0.85)",
          "brightness(0.95)"
        );
        break;
      default:
        // 'none' - no additional filters
        break;
    }

    this.video.style.filter = filters.join(" ");
  }

  applySkinSmoothingToPreview() {
    if (!this.video) return;

    // Apply skin smoothing effect using blur and brightness
    let smoothingFilters = [];

    if (this.skinTone > 0) {
      // Positive values = more smoothing
      const blurAmount = (this.skinTone / 50) * 1.5; // Max 1.5px blur
      const brightnessAmount = 1 + this.skinTone / 200; // Slight brightness boost
      smoothingFilters.push(
        `blur(${blurAmount}px)`,
        `brightness(${brightnessAmount})`
      );
    }

    // Combine with existing style filters
    this.applyStyleToPreview();

    // Add smoothing on top
    if (smoothingFilters.length > 0) {
      const currentFilter = this.video.style.filter || "";
      this.video.style.filter =
        currentFilter + " " + smoothingFilters.join(" ");
    }
  }

  applyFrameToPreview() {
    if (!this.frameOverlay) return;

    // Clear existing frame classes and content
    this.frameOverlay.className = "frame-overlay";
    this.frameOverlay.innerHTML = "";

    if (this.selectedFrame === "none") {
      return;
    }

    if (this.selectedFrame === "custom" && this.customFrameImage) {
      // Use custom uploaded frame
      const frameImg = document.createElement("img");
      frameImg.src = this.customFrameImage;
      frameImg.style.width = "100%";
      frameImg.style.height = "100%";
      frameImg.style.objectFit = "cover";
      frameImg.style.pointerEvents = "none";
      this.frameOverlay.appendChild(frameImg);
    } else if (this.frameAssets[this.selectedFrame]) {
      // Try to load PNG frame first
      const frameImg = document.createElement("img");
      frameImg.src = this.frameAssets[this.selectedFrame];
      frameImg.style.width = "100%";
      frameImg.style.height = "100%";
      frameImg.style.objectFit = "cover";
      frameImg.style.pointerEvents = "none";
      
      // Handle PNG loading success/failure
      frameImg.onload = () => {
        console.log(`✅ PNG frame loaded: ${this.selectedFrame}`);
      };
      
      frameImg.onerror = () => {
        console.log(`❌ PNG frame failed to load: ${this.selectedFrame}, using CSS fallback`);
        // Remove the failed image and use CSS fallback
        this.frameOverlay.innerHTML = "";
        this.frameOverlay.classList.add(`${this.selectedFrame}-frame`);
      };
      
      this.frameOverlay.appendChild(frameImg);
    } else {
      // Use CSS-based predefined frames as fallback
      this.frameOverlay.classList.add(`${this.selectedFrame}-frame`);
    }
  }

  // Removed getFrameImagePath method as we're using CSS-based frames

  async startPhotoCapture() {
    if (this.isCapturing) return;

    this.isCapturing = true;
    this.startCaptureBtn.disabled = true;
    this.startCaptureBtn.innerHTML =
      '<i class="fas fa-hourglass-half"></i> <span>Chuẩn bị...</span>';

    try {
      // Clear previous photos
      this.clearCapturedPhotos();

      // Show initial notification
      this.showNotification(`Sẽ chụp ${this.photoCount} ảnh với độ trễ ${this.captureDelay}s`, "info");
      
      // Capture photos based on selected count
      for (let i = 0; i < this.photoCount; i++) {
        // Show countdown before each photo
        await this.showCountdownBeforeCapture(i + 1);
        
        // Capture the photo
        await this.capturePhoto(i + 1);

        // Add delay between captures for multiple photos (shorter delay)
        if (i < this.photoCount - 1) {
          await this.delay(800);
          this.showNotification(`Ảnh ${i + 1}/${this.photoCount} hoàn thành! Chuẩn bị ảnh tiếp theo...`, "success");
        }
      }

      // Show completion message
      this.showNotification(`Hoàn thành! Đã chụp ${this.photoCount} ảnh`, "success");
      
      // Show captured photos and actions
      this.showPhotoActions();
    } catch (error) {
      console.error("Error during photo capture:", error);
      this.showNotification("Lỗi khi chụp ảnh!", "error");
    } finally {
      this.isCapturing = false;
      this.startCaptureBtn.disabled = false;
      this.startCaptureBtn.innerHTML =
        '<i class="fas fa-camera"></i> <span>Bắt đầu chụp</span>';
      // Hide countdown overlay if still visible
      this.hideCountdown();
    }
  }

  async capturePhoto(photoNumber) {
    return new Promise((resolve) => {
      // Capture the photo immediately (countdown already shown)
      const photoData = this.takeSnapshot();
      if (photoData) {
        this.capturedPhotos.push(photoData);
        this.displayCapturedPhoto(photoData, photoNumber);
        
        // Play capture sound and show flash effect
        if (window.playSound) {
          window.playSound("camera_capture");
        }
        this.showCaptureFlash();
      }
      resolve();
    });
  }

  showCountdown(photoNumber, callback) {
    let count = 3;
    const countdownInterval = setInterval(() => {
      // You can add visual countdown here
      console.log(`Photo ${photoNumber}: ${count}`);

      count--;
      if (count < 0) {
        clearInterval(countdownInterval);
        callback();
      }
    }, 1000);
  }

  takeSnapshot() {
    if (!this.video || !this.canvas) return null;

    const context = this.canvas.getContext("2d");
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;

    // Draw video frame
    context.drawImage(this.video, 0, 0);

    // Apply filters if needed
    this.applyCanvasFilters(context);

    // Convert to data URL
    return this.canvas.toDataURL("image/jpeg", 0.9);
  }

  applyCanvasFilters(context) {
    // Apply skin smoothing and style filters to canvas
    const imageData = context.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    // Apply skin smoothing if enabled
    if (this.skinTone > 0) {
      this.applySkinSmoothingToCanvas(context, imageData);
    }

    // Apply style-specific adjustments
    this.applyStyleFiltersToCanvas(context, imageData);

    context.putImageData(imageData, 0, 0);
  }

  applySkinSmoothingToCanvas(context, imageData) {
    // Simple skin smoothing algorithm
    const data = imageData.data;
    const smoothingIntensity = this.skinTone / 50; // 0 to 1

    // Create a copy for blur effect
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempContext = tempCanvas.getContext("2d");

    // Apply blur to temp canvas
    tempContext.filter = `blur(${smoothingIntensity * 2}px)`;
    tempContext.drawImage(this.canvas, 0, 0);

    // Blend original with blurred version
    const blurredData = tempContext.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );

    for (let i = 0; i < data.length; i += 4) {
      // Blend original with blurred for skin smoothing effect
      const blendFactor = smoothingIntensity * 0.6;
      data[i] = data[i] * (1 - blendFactor) + blurredData.data[i] * blendFactor; // Red
      data[i + 1] =
        data[i + 1] * (1 - blendFactor) + blurredData.data[i + 1] * blendFactor; // Green
      data[i + 2] =
        data[i + 2] * (1 - blendFactor) + blurredData.data[i + 2] * blendFactor; // Blue
    }
  }

  applyStyleFiltersToCanvas(context, imageData) {
    const data = imageData.data;

    switch (this.selectedStyle) {
      case "vintage":
        this.applyVintageFilter(data);
        break;
      case "retro":
        this.applyRetroFilter(data);
        break;
      case "minimal":
        this.applyGrayscaleFilter(data);
        break;
      case "bright":
        this.applyBrightnessFilter(data, 1.2);
        break;
      case "kawaii":
        this.applyKawaiiFilter(data);
        break;
      case "pastel":
        this.applyPastelFilter(data);
        break;
      case "film":
        this.applyFilmFilter(data);
        break;
    }
  }

  applyVintageFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Sepia effect
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }

  applyRetroFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      // Warm, saturated look
      data[i] = Math.min(255, data[i] * 1.1); // Boost red
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Slight green boost
      data[i + 2] = Math.min(255, data[i + 2] * 0.9); // Reduce blue
    }
  }

  applyGrayscaleFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  applyBrightnessFilter(data, factor) {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);
      data[i + 1] = Math.min(255, data[i + 1] * factor);
      data[i + 2] = Math.min(255, data[i + 2] * factor);
    }
  }

  applyKawaiiFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      // Pink-tinted, bright and saturated
      data[i] = Math.min(255, data[i] * 1.15); // Boost red
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // Slight green boost
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Boost blue
    }
  }

  applyPastelFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      // Soft, desaturated look
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = data[i] * 0.7 + avg * 0.3;
      data[i + 1] = data[i + 1] * 0.7 + avg * 0.3;
      data[i + 2] = data[i + 2] * 0.7 + avg * 0.3;
    }
  }

  applyFilmFilter(data) {
    for (let i = 0; i < data.length; i += 4) {
      // Film grain effect with slight sepia
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.9 + g * 0.1);
      data[i + 1] = Math.min(255, r * 0.05 + g * 0.85 + b * 0.1);
      data[i + 2] = Math.min(255, b * 0.8 + g * 0.1);
    }
  }

  displayCapturedPhoto(photoData, photoNumber) {
    const photoContainer = document.createElement("div");
    photoContainer.className = "captured-photo";

    const img = document.createElement("img");
    img.src = photoData;
    img.alt = `Captured photo ${photoNumber}`;

    photoContainer.appendChild(img);

    // Remove no-photos message if it exists
    const noPhotosMessage =
      this.capturedPhotosGrid.querySelector(".no-photos-message");
    if (noPhotosMessage) {
      noPhotosMessage.remove();
    }

    this.capturedPhotosGrid.appendChild(photoContainer);
  }

  clearCapturedPhotos() {
    this.capturedPhotos = [];
    this.capturedPhotosGrid.innerHTML = `
            <div class="no-photos-message">
                <i class="fas fa-camera"></i>
                <p>Chưa có ảnh nào</p>
            </div>
        `;
    this.hidePhotoActions();
  }

  showPhotoActions() {
    // Ensure photo actions are available and visible
    if (this.photoActions) {
      this.photoActions.classList.remove("hidden");
    }
    
    // Show success message with action options
    this.showNotification(
      `✅ Đã chụp ${this.capturedPhotos.length} ảnh! Chọn hành động tiếp theo.`, 
      "success"
    );
    
    // Play completion sound
    if (window.playSound) {
      window.playSound("photo_complete");
    }
  }

  hidePhotoActions() {
    this.photoActions.classList.add("hidden");
  }

  retakePhotos() {
    // Clear captured photos and reset UI
    this.clearCapturedPhotos();
    this.hidePhotoActions();
    
    // Show notification and play sound
    this.showNotification("🔄 Sẵn sàng chụp lại!", "info");
    if (window.playSound) {
      window.playSound("button_click");
    }
    
    // Reset capture button state
    this.startCaptureBtn.disabled = false;
    this.startCaptureBtn.innerHTML = '<i class="fas fa-camera"></i> <span>Bắt đầu chụp</span>';
  }

  continueToEdit() {
    if (this.capturedPhotos.length === 0) {
      this.showNotification("Vui lòng chụp ít nhất một ảnh!", "warning");
      return;
    }

    // Store captured photos data for next step
    window.capturedPhotosData = {
      photos: this.capturedPhotos,
      frame: this.selectedFrame,
      customFrame: this.customFrameImage,
      style: this.selectedStyle,
      skinTone: this.skinTone,
      photoCount: this.photoCount,
      captureDelay: this.captureDelay
    };

    // Show transition notification
    this.showNotification("🎨 Chuyển đến bước chỉnh sửa...", "info");
    
    // Play transition sound
    if (window.playSound) {
      window.playSound("step_complete");
    }

    // Navigate to step 2 with proper error handling
    try {
      if (window.app && typeof window.app.goToStep === 'function') {
        window.app.goToStep(2);
      } else {
        console.warn('App navigation not available, staying in Step 1');
        this.showNotification("Chức năng chỉnh sửa đang được phát triển!", "info");
      }
    } catch (error) {
      console.error('Error navigating to Step 2:', error);
      this.showNotification("Lỗi chuyển bước, vui lòng thử lại!", "error");
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Show countdown before capturing each photo
  async showCountdownBeforeCapture(photoNumber) {
    return new Promise((resolve) => {
      // Check if countdown overlay exists
      if (!this.countdownOverlay) {
        console.warn('Countdown overlay not found, skipping countdown');
        setTimeout(resolve, this.captureDelay * 1000);
        return;
      }
      
      // Show countdown overlay
      this.countdownOverlay.style.display = 'flex';
      
      let timeLeft = this.captureDelay;
      if (this.countdownNumber) {
        this.countdownNumber.textContent = timeLeft;
      }
      
      // Update countdown text based on photo number
      const countdownText = this.countdownOverlay.querySelector('.countdown-text');
      if (this.photoCount > 1) {
        countdownText.textContent = `Ảnh ${photoNumber}/${this.photoCount} - Chuẩn bị chụp!`;
      } else {
        countdownText.textContent = 'Chuẩn bị chụp!';
      }
      
      // Start countdown timer
      this.countdownTimer = setInterval(() => {
        timeLeft--;
        this.countdownNumber.textContent = timeLeft;
        
        // Play countdown sound
        if (window.playSound) {
          window.playSound("countdown_tick");
        }
        
        if (timeLeft <= 0) {
          clearInterval(this.countdownTimer);
          this.hideCountdown();
          resolve();
        }
      }, 1000);
    });
  }

  // Hide countdown overlay
  hideCountdown() {
    if (this.countdownOverlay) {
      this.countdownOverlay.style.display = 'none';
    }
  }

  // Show capture flash effect
  showCaptureFlash() {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 9999;
      opacity: 0.8;
      pointer-events: none;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => {
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(flash);
      }, 300);
    }, 100);
  }

  // Handle posing idea selection
  selectPosingIdea(posingItem) {
    // Remove previous selection
    document.querySelectorAll('.pose-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    posingItem.classList.add('selected');
    
    // Get pose data
    const poseType = posingItem.dataset.pose;
    
    // Get pose name from various large label types
    let poseName = 'Pose đẹp';
    const labelSelectors = [
      '.large-vn-label', '.large-korean-label', '.large-heart-label'
    ];
    
    for (const selector of labelSelectors) {
      const labelElement = posingItem.querySelector(selector);
      if (labelElement) {
        poseName = labelElement.textContent.replace(/[✨💖🌸🎊👑]/g, '').trim();
        break;
      }
    }
    
    // Show notification with pose instructions
    this.showNotification(
      `📸 Đã chọn pose: ${poseName}! Hãy thử tạo dáng này nhé!`, 
      "info"
    );
    
    // Play selection sound
    if (window.playSound) {
      window.playSound("select");
    }
    
    // Add sparkle effect
    this.addSparkleEffect(posingItem);
    
    // Store selected pose for capture
    this.selectedPose = poseType;
  }

  // Add sparkle effect to selected pose
  addSparkleEffect(element) {
    const sparkles = ['✨', '⭐', '💫', '🌟'];
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.cssText = `
          position: absolute;
          font-size: 1.2rem;
          pointer-events: none;
          z-index: 1000;
          animation: sparkle-float 1.5s ease-out forwards;
        `;
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
        sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
          document.body.removeChild(sparkle);
        }, 1500);
      }, i * 200);
    }
  }

  // Create posing assets directory structure info
  createPosingAssets() {
    console.log('📁 Posing idea assets should be placed in:');
    console.log('   assets/posing/cute-pose.png - Dễ thương pose (V-sign & smile)');
    console.log('   assets/posing/lovely-pose.png - Yêu kiều pose (Hand on cheek & head tilt)');
    console.log('   assets/posing/confident-pose.png - Tự tin pose (Pointing & looking away)');
    console.log('   assets/posing/kawaii-pose.png - Kawaii pose (Both hands on cheeks)');
    console.log('💡 Images should be 70x90px for optimal display');
    console.log('🎨 Beautiful fallback icons will show if PNG files are missing');
    console.log('✨ Each pose includes descriptive instructions for users');
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "15px 20px",
      borderRadius: "10px",
      color: "white",
      fontWeight: "600",
      zIndex: "10000",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
    });

    // Set background color based on type
    const colors = {
      success: "#4CAF50",
      error: "#f44336",
      warning: "#ff9800",
      info: "#2196F3",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Initialize Step 1 Manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("step-1")) {
    window.step1Manager = new Step1Manager();
    window.Step1Manager = Step1Manager;
  }
});
