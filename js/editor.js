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
        
        this.init();
    }
    
    init() {
        // Setup canvas
        this.setupCanvas();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load the captured photo
        this.loadCapturedPhoto();
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
        
        // Editor tabs
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
    }
    
    loadCapturedPhoto() {
        // Get the captured photo from camera canvas
        const cameraCanvas = document.getElementById('camera-canvas');
        if (cameraCanvas && cameraCanvas.width > 0 && cameraCanvas.height > 0) {
            const imageData = cameraCanvas.toDataURL('image/png');
            
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
        
        // For now, we'll just show a notification
        // In a full implementation, we would apply the frame to the photo
        playSound('frame_apply');
        showNotification(`Frame "${frameType}" selected! 🖼️`, 'success');
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
        // In a real implementation, we would integrate with social media APIs
        // For now, we'll just show a notification
        playSound('share');
        showNotification('Share feature coming soon! 📱', 'info');
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
