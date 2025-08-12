// Filters module for Hùng's Photobooth

class FilterManager {
    constructor() {
        this.filters = {
            none: {
                name: 'Original',
                description: 'No filter applied',
                fabricFilters: []
            },
            vintage: {
                name: 'Vintage',
                description: 'Classic film look with warm tones',
                fabricFilters: [
                    { type: 'brightness', value: -0.1 },
                    { type: 'contrast', value: 0.1 },
                    { type: 'sepia', value: true }
                ]
            },
            dreamy: {
                name: 'Dreamy',
                description: 'Soft and ethereal aesthetic',
                fabricFilters: [
                    { type: 'brightness', value: 0.1 },
                    { type: 'saturation', value: 0.2 }
                ]
            },
            bright: {
                name: 'Bright',
                description: 'Enhanced brightness for glowing effects',
                fabricFilters: [
                    { type: 'brightness', value: 0.2 },
                    { type: 'contrast', value: 0.1 }
                ]
            }
        };
    }
    
    /**
     * Apply a filter to an image
     * @param {string} filterName - Name of filter to apply
     * @param {fabric.Image} image - Image to apply filter to
     * @param {fabric.Canvas} canvas - Canvas containing the image
     */
    applyFilter(filterName, image, canvas) {
        const filter = this.filters[filterName];
        if (!filter) {
            console.warn(`Filter "${filterName}" not found`);
            return;
        }
        
        // Clear existing filters
        image.filters = [];
        
        // Apply new filters
        filter.fabricFilters.forEach(filterConfig => {
            let fabricFilter;
            
            switch(filterConfig.type) {
                case 'brightness':
                    fabricFilter = new fabric.Image.filters.Brightness({ brightness: filterConfig.value });
                    break;
                case 'contrast':
                    fabricFilter = new fabric.Image.filters.Contrast({ contrast: filterConfig.value });
                    break;
                case 'saturation':
                    fabricFilter = new fabric.Image.filters.Saturation({ saturation: filterConfig.value });
                    break;
                case 'sepia':
                    fabricFilter = new fabric.Image.filters.Sepia();
                    break;
                default:
                    console.warn(`Unsupported filter type: ${filterConfig.type}`);
                    return;
            }
            
            if (fabricFilter) {
                image.filters.push(fabricFilter);
            }
        });
        
        // Apply filters and render
        image.applyFilters();
        canvas.renderAll();
        
        // Play sound effect
        playSound('filter_apply');
        
        // Show notification
        showNotification(`Filter "${filter.name}" applied! 🎨`, 'success');
    }
    
    /**
     * Get filter data
     * @param {string} filterName - Name of filter
     * @returns {Object} Filter data
     */
    getFilter(filterName) {
        return this.filters[filterName] || null;
    }
    
    /**
     * Get all filters
     * @returns {Object} All filters
     */
    getAllFilters() {
        return this.filters;
    }
}

// Initialize filter manager
document.addEventListener('DOMContentLoaded', () => {
    window.filterManager = new FilterManager();
});

// Export FilterManager class
window.FilterManager = FilterManager;
