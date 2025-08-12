// Utility functions for Hùng's Photobooth

/**
 * Play a sound effect
 * @param {string} soundType - Type of sound to play
 */
function playSound(soundType) {
    // In a real implementation, we would play actual sounds
    // For now, we'll just log to console
    console.log(`Playing sound: ${soundType}`);
}

/**
 * Show a notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '12px';
    notification.style.color = 'white';
    notification.style.fontWeight = '600';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'transform 0.3s ease';
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4ade80, #22d3ee)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f87171, #fbbf24)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #a78bfa, #f472b6)';
    }
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Format timestamp for photo naming
 * @returns {string} Formatted timestamp
 */
function getTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hour}${minute}${second}`;
}

/**
 * Download image from canvas
 * @param {HTMLCanvasElement} canvas - Canvas element to download
 * @param {string} filename - Filename for download
 */
function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

/**
 * Convert data URL to Blob
 * @param {string} dataURL - Data URL to convert
 * @returns {Blob} Converted blob
 */
function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}

/**
 * Get random Korean-style sticker
 * @returns {string} Random sticker emoji
 */
function getRandomSticker() {
    const stickers = ['💖', '💕', '✨', '⭐', '🌟', '🌸', '🌺', '🌷', '🦋', '👑', '🎀', '🌈', '🎉', '🎊', '🎈', '🎁'];
    return stickers[Math.floor(Math.random() * stickers.length)];
}

/**
 * Get random cute caption
 * @returns {string} Random caption
 */
function getRandomCaption() {
    const captions = [
        'So cute! 💖',
        'Besties forever! ✨',
        'Korean style! 🇰🇷',
        'Aesthetic vibes! 🌸',
        'Perfect shot! 📸',
        'Smile more! 😊',
        'Cherish this moment! 💕',
        'Teen dreams! 🌈',
        'School days! 🎓',
        'Friendship goals! 👯',
        'Selfie time! 🤳',
        'Glow up! ✨',
        'Slay! 💅',
        'Vibes! 🌟'
    ];
    return captions[Math.floor(Math.random() * captions.length)];
}

// Export functions for use in other modules
window.playSound = playSound;
window.showNotification = showNotification;
window.getTimestamp = getTimestamp;
window.downloadCanvas = downloadCanvas;
window.dataURLToBlob = dataURLToBlob;
window.getRandomSticker = getRandomSticker;
window.getRandomCaption = getRandomCaption;
