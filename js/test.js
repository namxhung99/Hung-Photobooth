// Test script for Hùng's Photobooth

/**
 * Test all core functionality of the photobooth app
 */
function runTests() {
    console.log('🧪 Starting Hùng\'s Photobooth Tests...');
    
    // Test 1: Check if all required elements exist
    testDOMElements();
    
    // Test 2: Check if managers are initialized
    testManagers();
    
    // Test 3: Test utility functions
    testUtilities();
    
    // Test 4: Test camera functionality
    testCamera();
    
    console.log('✅ All tests completed!');
}

/**
 * Test if all required DOM elements exist
 */
function testDOMElements() {
    console.log('🔍 Testing DOM Elements...');
    
    const requiredElements = [
        'camera-preview',
        'camera-canvas',
        'capture-btn',
        'auto-capture-btn',
        'switch-camera-btn',
        'countdown-display',
        'template-overlay',
        'editor-canvas',
        'back-to-camera-btn',
        'save-photo-btn',
        'share-btn',
        'settings-btn',
        'settings-modal'
    ];
    
    let allFound = true;
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`❌ Element with ID "${id}" not found`);
            allFound = false;
        } else {
            console.log(`✅ Element "${id}" found`);
        }
    });
    
    if (allFound) {
        console.log('✅ All DOM elements found');
    }
}

/**
 * Test if managers are properly initialized
 */
function testManagers() {
    console.log('🔍 Testing Managers...');
    
    if (window.cameraManager) {
        console.log('✅ CameraManager initialized');
    } else {
        console.warn('⚠️ CameraManager not initialized');
    }
    
    if (window.templateManager) {
        console.log('✅ TemplateManager initialized');
        console.log('Templates available:', Object.keys(window.templateManager.getAllTemplates()));
    } else {
        console.warn('⚠️ TemplateManager not initialized');
    }
    
    if (window.filterManager) {
        console.log('✅ FilterManager initialized');
        console.log('Filters available:', Object.keys(window.filterManager.getAllFilters()));
    } else {
        console.warn('⚠️ FilterManager not initialized');
    }
}

/**
 * Test utility functions
 */
function testUtilities() {
    console.log('🔍 Testing Utility Functions...');
    
    // Test timestamp function
    const timestamp = getTimestamp();
    console.log('✅ getTimestamp() works:', timestamp);
    
    // Test random sticker function
    const sticker = getRandomSticker();
    console.log('✅ getRandomSticker() works:', sticker);
    
    // Test random caption function
    const caption = getRandomCaption();
    console.log('✅ getRandomCaption() works:', caption);
}

/**
 * Test camera functionality
 */
function testCamera() {
    console.log('🔍 Testing Camera Functionality...');
    
    if (window.cameraManager && window.cameraManager.stream) {
        console.log('✅ Camera stream active');
        console.log('📸 Camera resolution:', 
            window.cameraManager.video.videoWidth + 'x' + window.cameraManager.video.videoHeight);
    } else {
        console.warn('⚠️ Camera stream not active - user may need to grant permissions');
    }
}

// Run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure everything is initialized
    setTimeout(runTests, 2000);
});

// Export test function
window.runTests = runTests;
