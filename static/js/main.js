// Main application class
class SummaBrowse {
    constructor() {
        this.initElements();
        this.initEventListeners();
        this.activeSection = 'pdf-section';
    }

    // Initialize DOM elements
    initElements() {
        // Sidebar and navigation
        this.sidebar = document.querySelector('.sidebar');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.sectionTitle = document.getElementById('section-title');
        
        // File inputs and upload areas
        this.pdfUpload = document.getElementById('pdf-upload');
        this.pdfFileInput = document.getElementById('pdf-file');
        this.imageUpload = document.getElementById('image-upload');
        this.imageFileInput = document.getElementById('image-file');
        
        // Process buttons
        this.processPdfBtn = document.getElementById('process-pdf');
        this.processImageBtn = document.getElementById('process-image');
        this.processVideoBtn = document.getElementById('process-video');
        
        // Video URL input
        this.videoUrlInput = document.getElementById('video-url');
        
        // Results containers
        this.resultsContainers = {
            'pdf': document.getElementById('pdf-results'),
            'image': document.getElementById('image-results'),
            'video': document.getElementById('video-results')
        };
        
        // Loading overlay
        this.loadingOverlay = document.getElementById('loading-overlay');
    }

    // Initialize event listeners
    initEventListeners() {
        // Navigation
        this.navButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // File upload interactions
        this.setupFileUpload(this.pdfUpload, this.pdfFileInput);
        this.setupFileUpload(this.imageUpload, this.imageFileInput);

        // Process buttons
        this.processPdfBtn?.addEventListener('click', () => this.handlePdfUpload());
        this.processImageBtn?.addEventListener('click', () => this.handleImageUpload());
        this.processVideoBtn?.addEventListener('click', () => this.handleVideoUrl());

        // Allow pasting YouTube URLs
        this.videoUrlInput?.addEventListener('paste', (e) => {
            setTimeout(() => {
                this.videoUrlInput.dispatchEvent(new Event('input'));
            }, 0);
        });
    }

    // Handle navigation between sections
    handleNavClick(event) {
        event.preventDefault();
        const targetId = event.currentTarget.getAttribute('data-target');
        
        // Update active nav button
        this.navButtons.forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        
        // Update active section
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const activeSection = document.getElementById(targetId);
        if (activeSection) {
            activeSection.classList.add('active');
            this.activeSection = targetId;
            
            // Update section title
            const sectionName = event.currentTarget.querySelector('span').textContent;
            this.sectionTitle.textContent = sectionName;
        }
    }

    // Setup file upload with drag and drop
    setupFileUpload(uploadArea, fileInput) {
        if (!uploadArea || !fileInput) return;

        // Click to select file
        uploadArea.addEventListener('click', () => fileInput.click());

        // Handle drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.add('highlight');
            });
        });

        // Remove highlight when drag leaves or drops
        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => {
                uploadArea.classList.remove('highlight');
            });
        });

        // Handle dropped files
        uploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                fileInput.files = files;
                this.updateFileInfo(uploadArea, files[0]);
            }
        });

        // Handle file selection via input
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length) {
                this.updateFileInfo(uploadArea, fileInput.files[0]);
            }
        });
    }

    // Update file info display
    updateFileInfo(uploadArea, file) {
        const fileInfo = uploadArea.querySelector('.file-info');
        if (fileInfo) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2);
            fileInfo.textContent = `Selected: ${file.name} (${fileSize} MB)`;
            
            // Add success feedback
            uploadArea.classList.add('success');
            setTimeout(() => uploadArea.classList.remove('success'), 2000);
        }
    }

    // Handle PDF upload
    async handlePdfUpload() {
        if (!this.pdfFileInput.files.length) {
            this.showError('Please select a PDF file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.pdfFileInput.files[0]);
        
        await this.submitForm('/pdf/process', formData, 'pdf');
    }

    // Handle image upload
    async handleImageUpload() {
        if (!this.imageFileInput.files.length) {
            this.showError('Please select an image file first');
            return;
        }

        const formData = new FormData();
        formData.append('file', this.imageFileInput.files[0]);
        
        await this.submitForm('/image/process', formData, 'image');
    }

    // Handle video URL submission
    async handleVideoUrl() {
        const videoUrl = this.videoUrlInput?.value.trim();
        if (!videoUrl) {
            this.showError('Please enter a YouTube URL');
            return;
        }

        const formData = new FormData();
        formData.append('url', videoUrl);
        
        await this.submitForm('/video/process', formData, 'video');
    }

    // Generic form submission handler
    async submitForm(url, formData, type) {
        this.showLoading(true);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.displayResults(result.summary || result.text, type);
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message || 'An error occurred while processing your request');
        } finally {
            this.showLoading(false);
        }
    }

    // Display results in the UI
    displayResults(content, type) {
        const resultsContainer = this.resultsContainers[type];
        if (!resultsContainer) return;
        
        // Format the content with line breaks
        const formattedContent = content.replace(/\n/g, '<br>');
        
        resultsContainer.innerHTML = `
            <div class="result-header">
                <h3>Summary Results</h3>
                <button class="btn-icon copy-btn" title="Copy to clipboard">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="result-content">
                ${formattedContent}
            </div>
        `;
        
        // Show the results container
        resultsContainer.style.display = 'block';
        
        // Add copy to clipboard functionality
        const copyBtn = resultsContainer.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyToClipboard(content));
        }
        
        // Scroll to results
        setTimeout(() => {
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    // Copy text to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Show success feedback
            const copyBtn = document.querySelector('.copy-btn');
            if (copyBtn) {
                const icon = copyBtn.querySelector('i');
                const originalIcon = icon.className;
                
                copyBtn.classList.add('success');
                icon.className = 'fas fa-check';
                
                setTimeout(() => {
                    copyBtn.classList.remove('success');
                    icon.className = originalIcon;
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    }

    // Show loading overlay
    showLoading(show) {
        if (show) {
            this.loadingOverlay.style.display = 'flex';
            setTimeout(() => this.loadingOverlay.classList.add('active'), 10);
        } else {
            this.loadingOverlay.classList.remove('active');
            setTimeout(() => {
                if (!this.loadingOverlay.classList.contains('active')) {
                    this.loadingOverlay.style.display = 'none';
                }
            }, 300);
        }
    }

    // Show error message
    showError(message) {
        // Remove any existing error messages
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Insert error message after the active section's upload card
        const activeSection = document.querySelector(`#${this.activeSection}`);
        const uploadCard = activeSection?.querySelector('.upload-card');
        if (uploadCard) {
            uploadCard.parentNode.insertBefore(errorElement, uploadCard.nextSibling);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                errorElement.style.opacity = '0';
                setTimeout(() => errorElement.remove(), 300);
            }, 5000);
        }
    }

    // Prevent default drag and drop behavior
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a new instance of our application
    window.summaBrowse = new SummaBrowse();
    
    // Set the first tab as active by default
    const firstNavBtn = document.querySelector('.nav-btn');
    if (firstNavBtn) {
        firstNavBtn.click();
    }
});
