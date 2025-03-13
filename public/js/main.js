/**
 * Futuristic Memes - Main JavaScript
 * Handles interactive elements across the site
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggler
  const navbarToggle = document.getElementById('navbar-toggle');
  const navbarMenu = document.getElementById('navbar-menu');
  
  if (navbarToggle && navbarMenu) {
    navbarToggle.addEventListener('click', () => {
      navbarMenu.classList.toggle('active');
    });
  }
  
  // Footer scroll behavior
  const footer = document.querySelector('.footer');
  let lastScrollTop = 0;
  let scrollingUp = false;
  
  if (footer) {
    const contentContainer = document.querySelector('.content-container');
    const memeFeeds = document.querySelectorAll('.meme-feed, .meme-grid');
    
    if (memeFeeds.length > 0) {
      memeFeeds.forEach(memeFeed => {
        memeFeed.addEventListener('scroll', function() {
          const scrollTop = this.scrollTop;
          scrollingUp = scrollTop < lastScrollTop;
          
          // Calculate if we're near the bottom of the content
          const isNearBottom = this.scrollHeight - this.scrollTop - this.clientHeight < 100;
          
          // Show footer only when near the bottom AND not actively scrolling up
          if (isNearBottom && !scrollingUp) {
            footer.classList.add('visible');
          } else {
            footer.classList.remove('visible');
          }
          
          lastScrollTop = scrollTop;
        });
      });
    } else {
      // For pages without meme feed
      window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollingUp = scrollTop < lastScrollTop;
        
        // Calculate if we're near the bottom of the page
        const isNearBottom = 
          (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 100;
        
        // Show footer only when near the bottom AND not actively scrolling up
        if (isNearBottom && !scrollingUp) {
          footer.classList.add('visible');
        } else {
          footer.classList.remove('visible');
        }
        
        lastScrollTop = scrollTop;
      });
    }
  }
  
  // Close flash messages
  const messageCloseButtons = document.querySelectorAll('.message .close-btn');
  
  messageCloseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const message = button.closest('.message');
      message.style.opacity = '0';
      setTimeout(() => {
        message.style.display = 'none';
      }, 300);
    });
  });
  
  // Auto-close flash messages after 5 seconds
  setTimeout(() => {
    const messages = document.querySelectorAll('.message');
    messages.forEach(message => {
      message.style.opacity = '0';
      setTimeout(() => {
        message.style.display = 'none';
      }, 300);
    });
  }, 5000);
  
  // Mobile dropdown toggles
  const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
  
  if (window.innerWidth < 768) {
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const dropdown = toggle.closest('.dropdown');
        dropdown.classList.toggle('active');
      });
    });
  }
  
  // Image preview for upload form
  const imageInput = document.querySelector('.file-input');
  const previewContainer = document.querySelector('.upload-preview');
  const previewImage = document.createElement('img');
  const uploadPlaceholder = document.querySelector('.upload-placeholder');
  
  if (imageInput && previewContainer) {
    imageInput.addEventListener('change', function() {
      const file = this.files[0];
      
      if (file) {
        const reader = new FileReader();
        
        reader.addEventListener('load', function() {
          previewImage.setAttribute('src', this.result);
          if (uploadPlaceholder) {
            uploadPlaceholder.style.display = 'none';
          }
          previewContainer.appendChild(previewImage);
        });
        
        reader.readAsDataURL(file);
      }
    });
  }
  
  // Like functionality
  const likeButtons = document.querySelectorAll('.like-button');
  
  likeButtons.forEach(button => {
    button.addEventListener('click', async function() {
      const memeId = this.getAttribute('data-id');
      
      try {
        const response = await fetch(`/memes/${memeId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update like count
          const likeCount = this.querySelector('.like-count');
          if (likeCount) {
            likeCount.textContent = data.likes;
          }
          
          // Toggle liked class
          this.classList.toggle('liked', data.hasLiked);
          
          // Update icon
          const icon = this.querySelector('i');
          if (icon) {
            icon.className = data.hasLiked ? 'fas fa-heart' : 'far fa-heart';
          }
        }
      } catch (err) {
        console.error('Error liking meme:', err);
      }
    });
  });
  
  // Admin tabs
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminTabContents = document.querySelectorAll('.admin-tab-content');
  
  if (adminTabs.length && adminTabContents.length) {
    adminTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        adminTabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Hide all tab contents
        adminTabContents.forEach(content => {
          content.style.display = 'none';
        });
        
        // Show selected tab content
        const tabId = tab.getAttribute('data-tab');
        const tabContent = document.getElementById(tabId);
        if (tabContent) {
          tabContent.style.display = 'block';
        }
      });
    });
  }
  
  // Confirm deletes
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        e.preventDefault();
      }
    });
  });
  
  // Loading animations for forms
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', () => {
      const submitButton = form.querySelector('button[type="submit"]');
      
      if (submitButton) {
        // Disable button and show loading state
        submitButton.disabled = true;
        
        // Store original text
        const originalText = submitButton.innerHTML;
        
        // Show loading spinner
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Restore button state after 30 seconds in case of errors
        setTimeout(() => {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }, 30000);
      }
    });
  });
}); 