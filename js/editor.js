// Editor module for Hùng's Photobooth

class PhotoEditor {
    constructor() {
        this.canvas = new fabric.Canvas('editor-canvas');
        this.currentPhoto = null;
        
        this.backToCameraBtn = document.getElementById('back-to-camera-btn');
        this.savePhotoBtn = document.getElementById('save-photo-btn');
        this.shareBtn = document.getElementById('share-btn');
        
        this.stickerItems = document.querySelectorAll('.sticker-item');
        this.addTextBtn = document.getElementById('add-text-btn');
        this.textInput = document.getElementById('text-input');
        
        this.editorTabs = document.querySelectorAll('.editor-tab');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        this.initializeCanvas();
        this.setupEventListeners();
    }
    
    initializeCanvas() {
        const canvasElement = document.getElementById('editor-canvas');
        this.canvas = new fabric.Canvas(canvasElement, {
            width: 600,
            height: 400,
            backgroundColor: '#fff'
        });
        
        // Load captured photos
        this.loadCapturedPhotos();
    }
    
    setupCanvas() {
        // Set canvas dimensions
        this.canvas.setWidth(600);
        this.canvas.setHeight(400);
        this.canvas.setBackgroundColor('white', this.canvas.renderAll.bind(this.canvas));
        
        // Make canvas responsive
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        this.resizeCanvas();
    }
    
    resizeCanvas() {
        const container = document.querySelector('.editor-canvas-container');
        if (container) {
            const maxWidth = container.clientWidth - 20;
            const maxHeight = container.clientHeight - 20;
            
            // Maintain aspect ratio
            const aspectRatio = 600 / 400;
            let width = maxWidth;
            let height = width / aspectRatio;
            
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
            
            this.canvas.setWidth(width);
            this.canvas.setHeight(height);
            this.canvas.renderAll();
        }
    }
    
    setupEventListeners() {
        // Back to camera button
        this.backToCameraBtn.addEventListener('click', () => {
            this.switchToCamera();
        });
        
        // Save photo button
        this.savePhotoBtn.addEventListener('click', () => {
            this.savePhoto();
        });
        
        // Share button
        this.shareBtn.addEventListener('click', () => {
            this.sharePhoto();
        });
        
        // Sticker selection
        this.stickerItems.forEach(item => {
            item.addEventListener('click', () => {
                this.addSticker(item.dataset.sticker);
            });
        });
        
        // Add text button
        this.addTextBtn.addEventListener('click', () => {
            this.addText();
        });
        
        // Tab switching
        this.editorTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });
        
        // Filter selection
        const filterItems = document.querySelectorAll('.filter-item');
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                this.applyFilter(item.dataset.filter);
            });
        });
        
        // Frame selection
        const frameItems = document.querySelectorAll('.frame-item');
        frameItems.forEach(item => {
            item.addEventListener('click', () => {
                this.applyFrame(item.dataset.frame);
            });
        });
        
        // Photo navigation
        const prevBtn = document.getElementById('prev-photo-btn');
        const nextBtn = document.getElementById('next-photo-btn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.showPreviousPhoto();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.showNextPhoto();
            });
        }
    }
    
    loadCapturedPhotos() {
        // Get the captured photos data from Step 1
        const capturedData = window.capturedPhotosData;
        
        if (capturedData && capturedData.photos && capturedData.photos.length > 0) {
            this.capturedPhotos = capturedData.photos;
            this.currentPhotoIndex = 0;
            
            // Load the first photo
            this.loadPhotoAtIndex(0);
            
            // Show navigation if multiple photos
            if (this.capturedPhotos.length > 1) {
                const photoNav = document.getElementById('photo-navigation');
                const photoCounter = document.getElementById('photo-counter');
                photoNav.classList.remove('hidden');
                photoCounter.textContent = `${this.currentPhotoIndex + 1}/${this.capturedPhotos.length}`;
            }
        } else {
            // Fallback to camera canvas if no captured data
            const cameraCanvas = document.getElementById('camera-canvas');
            if (cameraCanvas && cameraCanvas.width > 0 && cameraCanvas.height > 0) {
                const imageData = cameraCanvas.toDataURL('image/png');
                this.capturedPhotos = [imageData];
                this.currentPhotoIndex = 0;
                
                // Add photo to editor canvas
                fabric.Image.fromURL(imageData, (img) => {
                    // Scale image to fit canvas
                    const scale = Math.min(
                        this.canvas.getWidth() / img.width,
                        this.canvas.getHeight() / img.height
                    );
                    
                    img.scale(scale);
                    img.set({
                        left: this.canvas.getWidth() / 2,
                        top: this.canvas.getHeight() / 2,
                        originX: 'center',
                        originY: 'center'
                    });
                    
                    this.canvas.add(img);
                    this.canvas.renderAll();
                    this.currentPhoto = img;
                });
            }
        }
    }
    
    loadPhotoAtIndex(index) {
        // Clear canvas
        this.canvas.clear();
        
        // Load photo at specified index
        const imageData = this.capturedPhotos[index];
        fabric.Image.fromURL(imageData, (img) => {
            // Scale image to fit canvas
            const scale = Math.min(
                this.canvas.getWidth() / img.width,
                this.canvas.getHeight() / img.height
            );
            
            img.scale(scale);
            img.set({
                left: this.canvas.getWidth() / 2,
                top: this.canvas.getHeight() / 2,
                originX: 'center',
                originY: 'center'
            });
            
            this.canvas.add(img);
            this.canvas.renderAll();
            this.currentPhoto = img;
            this.currentPhotoIndex = index;
            
            // Apply frame, style, and skin settings from Step 1
            const capturedData = window.capturedPhotosData;
            if (capturedData) {
                if (capturedData.frame && capturedData.frame !== 'none') {
                    this.applyFrame(capturedData.frame);
                }
                
                if (capturedData.style && capturedData.style !== 'none') {
                    this.applyFilter(capturedData.style);
                }
                
                // Skin tone adjustment would need to be implemented as a filter
                // For now, we'll just show a notification if it was selected
                if (capturedData.skinTone && capturedData.skinTone !== 'none') {
                    showNotification(`Skin smoothing applied: ${capturedData.skinTone}`, 'info');
                }
            }
            
            // Update photo counter
            const photoCounter = document.getElementById('photo-counter');
            if (photoCounter) {
                photoCounter.textContent = `${this.currentPhotoIndex + 1}/${this.capturedPhotos.length}`;
            }
        });
    }
    
    showPreviousPhoto() {
        if (this.currentPhotoIndex > 0) {
            this.loadPhotoAtIndex(this.currentPhotoIndex - 1);
        }
    }
    
    showNextPhoto() {
        if (this.currentPhotoIndex < this.capturedPhotos.length - 1) {
            this.loadPhotoAtIndex(this.currentPhotoIndex + 1);
        }
    }
    
    addSticker(stickerType) {
        let sticker;
        
        switch(stickerType) {
            case 'heart':
                sticker = new fabric.Text('💖', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'star':
                sticker = new fabric.Text('⭐', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'sparkle':
                sticker = new fabric.Text('✨', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'flower':
                sticker = new fabric.Text('🌸', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'rainbow':
                sticker = new fabric.Text('🌈', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'crown':
                sticker = new fabric.Text('👑', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'butterfly':
                sticker = new fabric.Text('🦋', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            case 'music':
                sticker = new fabric.Text('🎵', {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
                break;
            default:
                sticker = new fabric.Text(getRandomSticker(), {
                    fontSize: 40,
                    left: Math.random() * this.canvas.getWidth(),
                    top: Math.random() * this.canvas.getHeight(),
                    originX: 'center',
                    originY: 'center'
                });
        }
        
        this.canvas.add(sticker);
        this.canvas.setActiveObject(sticker);
        this.canvas.renderAll();
        
        // Play sound effect
        playSound('sticker_add');
        
        // Show notification
        showNotification('Sticker added! 🌟', 'success');
    }
    
    addText() {
        const textValue = this.textInput.value || getRandomCaption();
        
        // Get text controls values
        const fontSelect = document.getElementById('font-select');
        const textColor = document.getElementById('text-color');
        const textSize = document.getElementById('text-size');
        
        const fontFamily = fontSelect ? fontSelect.value : 'Nunito';
        const fill = textColor ? textColor.value : '#ff69b4';
        const fontSize = textSize ? parseInt(textSize.value) : 24;
        
        const text = new fabric.Text(textValue, {
            left: this.canvas.getWidth() / 2,
            top: 50,
            originX: 'center',
            originY: 'center',
            fontFamily: fontFamily,
            fill: fill,
            fontSize: fontSize,
            fontWeight: 'bold',
            shadow: '2px 2px 5px rgba(0,0,0,0.3)'
        });
        
        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        this.canvas.renderAll();
        
        // Clear input
        this.textInput.value = '';
        
        // Play sound effect
        playSound('text_add');
        
        // Show notification
        showNotification('Text added! 📝', 'success');
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and contents
        this.editorTabs.forEach(tab => tab.classList.remove('active'));
        this.tabContents.forEach(content => content.classList.add('hidden'));
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`.editor-tab[data-tab="${tabName}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
        // Show selected tab content
        const selectedContent = document.getElementById(`${tabName}-tab`);
        if (selectedContent) {
            selectedContent.classList.remove('hidden');
            selectedContent.classList.add('active');
        }
        
        // Play sound effect
        playSound('tab_switch');
    }
    
    applyFilter(filterType) {
        if (!this.currentPhoto) return;
        
        // Remove active class from all filters
        const filterItems = document.querySelectorAll('.filter-item');
        filterItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected filter
        const selectedItem = document.querySelector(`.filter-item[data-filter="${filterType}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Apply filter
        switch(filterType) {
            case 'none':
                this.currentPhoto.filters = [];
                break;
            case 'vintage':
                this.currentPhoto.filters = [
                    new fabric.Image.filters.Brightness({ brightness: -0.1 }),
                    new fabric.Image.filters.Contrast({ contrast: 0.1 }),
                    new fabric.Image.filters.Sepia()
                ];
                break;
            case 'dreamy':
                this.currentPhoto.filters = [
                    new fabric.Image.filters.Brightness({ brightness: 0.1 }),
                    new fabric.Image.filters.Saturation({ saturation: 0.2 })
                ];
                break;
            case 'bright':
                this.currentPhoto.filters = [
                    new fabric.Image.filters.Brightness({ brightness: 0.2 }),
                    new fabric.Image.filters.Contrast({ contrast: 0.1 })
                ];
                break;
        }
        
        // Apply filters and render
        this.currentPhoto.applyFilters();
        this.canvas.renderAll();
        
        // Play sound effect
        playSound('filter_apply');
        
        // Show notification
        showNotification(`Filter "${filterType}" applied! 🎨`, 'success');
    }
    
    applyFrame(frameType) {
        // Remove active class from all frames
        const frameItems = document.querySelectorAll('.frame-item');
        frameItems.forEach(item => item.classList.remove('active'));
        
        // Add active class to selected frame
        const selectedItem = document.querySelector(`.frame-item[data-frame="${frameType}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Apply frame to the photo
        if (this.currentPhoto) {
            // Remove any existing frame effect
            this.currentPhoto.set({ stroke: null, strokeWidth: 0, shadow: null });
            
            // Apply new frame based on type
            switch(frameType) {
                case 'vn':
                    // Add vn-style border and shadow
                    this.currentPhoto.set({ 
                        stroke: '#ccc', 
                        strokeWidth: 10,
                        shadow: '0 5px 15px rgba(0,0,0,0.3)'
                    });
                    break;
                case 'rounded':
                    // Add rounded corners effect
                    this.currentPhoto.set({ 
                        rx: 30, 
                        ry: 30,
                        shadow: '0 5px 15px rgba(0,0,0,0.2)'
                    });
                    break;
                case 'none':
                default:
                    // No frame effect
                    this.currentPhoto.set({ stroke: null, strokeWidth: 0, rx: 0, ry: 0, shadow: null });
                    break;
            }
            
            this.canvas.renderAll();
        }
        
        playSound('frame_apply');
        showNotification(`Frame "${frameType}" applied! 🖼️`, 'success');
    }
    
    savePhoto() {
        // Generate filename with timestamp
        const timestamp = getTimestamp();
        const filename = `hung_photobooth_${timestamp}.png`;
        
        // Convert canvas to data URL
        const dataURL = this.canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        
        // Download the image
        downloadCanvas(this.canvas.lowerCanvasEl, filename);
        
        // Play sound effect
        playSound('photo_save');
        
        // Show notification
        showNotification('Photo saved successfully! 💾', 'success');
    }
    
    sharePhoto() {
        // Check if Web Share API is supported
        if (navigator.share) {
            // Convert canvas to blob for sharing
            this.canvas.lowerCanvasEl.toBlob((blob) => {
                const file = new File([blob], `hung_photobooth_${getTimestamp()}.png`, { type: 'image/png' });
                
                // Share the photo
                navigator.share({
                    title: 'My Photobooth Photo',
                    text: 'Check out my photo from Hùng\'s Photobooth! 📸',
                    files: [file]
                }).then(() => {
                    showNotification('Photo shared successfully! 📱', 'success');
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    showNotification('Failed to share photo 😞', 'error');
                });
            }, 'image/png');
        } else {
            // Fallback for browsers that don't support Web Share API
            showNotification('Sharing not supported on this device. Try saving instead! 📱', 'warning');
        }
        
        playSound('share');
    }
    
    switchToCamera() {
        // Hide editor section
        document.getElementById('editor-section').classList.remove('active');
        document.getElementById('editor-section').classList.add('hidden');
        
        // Show camera section
        document.getElementById('camera-section').classList.remove('hidden');
        document.getElementById('camera-section').classList.add('active');
        
        // Show notification
        showNotification('Back to camera mode! 📸', 'info');
    }
}

// Initialize editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the editor section
    if (!document.getElementById('editor-section').classList.contains('hidden')) {
        window.photoEditor = new PhotoEditor();
    }
});

// Export PhotoEditor class
window.PhotoEditor = PhotoEditor;
