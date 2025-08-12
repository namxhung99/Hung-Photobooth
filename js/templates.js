// Templates module for Hùng's Photobooth

class TemplateManager {
    constructor() {
        this.templates = {
            cute: {
                name: 'Cute',
                description: 'Kawaii-inspired designs with pastels',
                backgroundColor: '#ffd3e0',
                elements: [
                    { type: 'text', content: '💖', x: 0.1, y: 0.1, size: 30 },
                    { type: 'text', content: '💕', x: 0.9, y: 0.9, size: 30 }
                ]
            },
            retro: {
                name: 'Retro',
                description: 'Y2K and vintage film camera aesthetics',
                backgroundColor: '#fad0c4',
                elements: [
                    { type: 'text', content: '📼', x: 0.1, y: 0.1, size: 30 },
                    { type: 'text', content: '🎞️', x: 0.9, y: 0.9, size: 30 }
                ]
            },
            neon: {
                name: 'Neon',
                description: 'Bright cyberpunk Korean street vibes',
                backgroundColor: '#fc00ff',
                elements: [
                    { type: 'text', content: '霓虹', x: 0.5, y: 0.5, size: 20 }
                ]
            },
            couple: {
                name: 'Couple',
                description: 'Romantic themes for couples and best friends',
                backgroundColor: '#fda085',
                elements: [
                    { type: 'text', content: '❤️', x: 0.2, y: 0.2, size: 30 },
                    { type: 'text', content: '🧡', x: 0.8, y: 0.8, size: 30 }
                ]
            },
            minimal: {
                name: 'Minimal',
                description: 'Clean, modern Korean design',
                backgroundColor: '#c2e9fb',
                elements: [
                    { type: 'text', content: '✨', x: 0.5, y: 0.5, size: 30 }
                ]
            },
            school: {
                name: 'School',
                description: 'Fun templates for school events and friend groups',
                backgroundColor: '#d4fc79',
                elements: [
                    { type: 'text', content: '🎓', x: 0.1, y: 0.1, size: 30 },
                    { type: 'text', content: '📚', x: 0.9, y: 0.9, size: 30 }
                ]
            }
        };
        
        this.currentTemplate = 'cute';
    }
    
    /**
     * Apply a template to the canvas
     * @param {string} templateName - Name of template to apply
     * @param {fabric.Canvas} canvas - Canvas to apply template to
     */
    applyTemplate(templateName, canvas) {
        const template = this.templates[templateName];
        if (!template) {
            console.warn(`Template "${templateName}" not found`);
            return;
        }
        
        // Set background color
        canvas.setBackgroundColor(template.backgroundColor, canvas.renderAll.bind(canvas));
        
        // Add template elements
        template.elements.forEach(element => {
            if (element.type === 'text') {
                const text = new fabric.Text(element.content, {
                    left: canvas.getWidth() * element.x,
                    top: canvas.getHeight() * element.y,
                    originX: 'center',
                    originY: 'center',
                    fontSize: element.size,
                    selectable: false
                });
                canvas.add(text);
            }
        });
        
        this.currentTemplate = templateName;
        
        // Play sound effect
        playSound('template_apply');
        
        // Show notification
        showNotification(`Template "${template.name}" applied! 🎨`, 'success');
    }
    
    /**
     * Get template preview data
     * @param {string} templateName - Name of template
     * @returns {Object} Template data
     */
    getTemplate(templateName) {
        return this.templates[templateName] || null;
    }
    
    /**
     * Get all templates
     * @returns {Object} All templates
     */
    getAllTemplates() {
        return this.templates;
    }
    
    /**
     * Get current template name
     * @returns {string} Current template name
     */
    getCurrentTemplate() {
        return this.currentTemplate;
    }
}

// Initialize template manager
document.addEventListener('DOMContentLoaded', () => {
    window.templateManager = new TemplateManager();
});

// Export TemplateManager class
window.TemplateManager = TemplateManager;
