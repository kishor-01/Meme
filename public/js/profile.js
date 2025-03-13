/**
 * Futuristic Memes - Profile Page JavaScript
 * Handles interactive elements on profile pages
 */

document.addEventListener('DOMContentLoaded', () => {
  // Setup double-click to like on meme cards
  setupProfileDoubleLike();
  
  /**
   * Setup double-click to like on profile meme cards
   */
  function setupProfileDoubleLike() {
    const memeCards = document.querySelectorAll('.meme-card');
    
    memeCards.forEach(card => {
      const cardImg = card.querySelector('.meme-card-img');
      if (!cardImg) return;
      
      const memeId = card.getAttribute('data-id');
      if (!memeId) return;
      
      // Create a heart animation element
      const heartAnimation = document.createElement('div');
      heartAnimation.className = 'heart-animation';
      heartAnimation.innerHTML = '<i class="fas fa-heart"></i>';
      cardImg.appendChild(heartAnimation);
      
      // Add double click event listener
      cardImg.addEventListener('dblclick', async function(e) {
        e.preventDefault();
        
        // Play heart animation
        heartAnimation.classList.add('active');
        
        try {
          const response = await fetch(`/memes/${memeId}/like`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Update like count in the UI
            const likesEl = card.querySelector('.meme-likes');
            if (likesEl) {
              const countEl = likesEl.querySelector('span') || likesEl;
              if (countEl) countEl.textContent = data.likes;
            }
            
            // Update overlay stats
            const overlayLikesEl = card.querySelector('.meme-card-overlay-stat:first-child');
            if (overlayLikesEl) {
              overlayLikesEl.innerHTML = `<i class="fas fa-heart"></i> ${data.likes}`;
            }
            
            // Change heart icon to solid if it was regular
            const likeIcon = card.querySelector('.meme-likes i');
            if (likeIcon && likeIcon.classList.contains('far')) {
              likeIcon.classList.remove('far');
              likeIcon.classList.add('fas');
            }
          }
        } catch (error) {
          console.error('Error liking meme:', error);
        }
        
        // Remove the animation class after animation completes
        setTimeout(() => {
          heartAnimation.classList.remove('active');
        }, 1000);
      });
    });
  }
  
  // Show toast message function
  function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      document.body.appendChild(toast);
      
      // Add styles if not already in CSS
      if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
          #toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 10000;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            max-width: 80%;
            text-align: center;
            backdrop-filter: blur(4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          #toast-notification.show {
            opacity: 1;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Set message and show toast
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}); 