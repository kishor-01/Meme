/**
 * Feed JavaScript - Enhanced Instagram-like Reels Experience
 */

document.addEventListener('DOMContentLoaded', function() {
  // Set profile images
  document.querySelectorAll('.reel-avatar-image').forEach(avatar => {
    const profileImage = avatar.getAttribute('data-profile-image');
    if (profileImage) {
      avatar.style.backgroundImage = `url('${profileImage}')`;
    }
  });
  
  // Variables
  const reelsContainer = document.querySelector('.reels-container');
  const reelItems = document.querySelectorAll('.reel-item');
  const hashtagItems = document.querySelectorAll('.hashtag-item');
  
  // Elements
  const memeFeed = document.getElementById('meme-feed');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const reportModal = document.getElementById('report-modal');
  const shareModal = document.getElementById('share-modal');
  const reportForm = document.getElementById('report-form');
  const reportReasonSelect = document.getElementById('report-reason');
  const otherReasonGroup = document.getElementById('other-reason-group');
  const reportMemeId = document.getElementById('report-meme-id');
  const shareLink = document.getElementById('share-link');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const shareTwitter = document.getElementById('share-twitter');
  const shareFacebook = document.getElementById('share-facebook');
  const shareReddit = document.getElementById('share-reddit');
  const shareWhatsapp = document.getElementById('share-whatsapp');
  
  // Navigation buttons
  const globalPrevBtn = document.querySelector('.global-navigation-controls .prev-btn');
  const globalNextBtn = document.querySelector('.global-navigation-controls .next-btn');
  const memePrevBtns = document.querySelectorAll('.prev-meme');
  const memeNextBtns = document.querySelectorAll('.next-meme');
  
  // Initialize modals
  const closeButtons = document.querySelectorAll('.close');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      reportModal.classList.remove('open');
      shareModal.classList.remove('open');
    });
  });
  
  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === reportModal) {
      reportModal.classList.remove('open');
    }
    if (e.target === shareModal) {
      shareModal.classList.remove('open');
    }
  });
  
  // Handle hashtag filtering
  hashtagItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all hashtags
      hashtagItems.forEach(tag => tag.classList.remove('active'));
      
      // Add active class to clicked hashtag
      this.classList.add('active');
      
      const tag = this.textContent.trim();
      filterMemesByTag(tag);
    });
  });
  
  // Filter memes by hashtag
  function filterMemesByTag(tag) {
    // If "All" is selected, show all memes
    if (tag === 'All') {
      reelItems.forEach(item => {
        item.style.display = 'block';
      });
      return;
    }
    
    // Remove # if present
    const tagText = tag.startsWith('#') ? tag.substring(1) : tag;
    
    // Filter memes
    reelItems.forEach(item => {
      const memeTags = item.getAttribute('data-tags');
      if (memeTags && memeTags.toLowerCase().includes(tagText.toLowerCase())) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }
  
  // Handle report reason selection
  if (reportReasonSelect) {
    reportReasonSelect.addEventListener('change', () => {
      if (reportReasonSelect.value === 'other') {
        otherReasonGroup.style.display = 'block';
      } else {
        otherReasonGroup.style.display = 'none';
      }
    });
  }
  
  // Load more functionality
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', loadMoreMemes);
  }
  
  // Initialize interaction buttons
  initLikeButtons();
  initDislikeButtons();
  initSaveButtons();
  initShareButtons();
  initReportButtons();
  
  // Setup double-click like functionality
  setupDoubleClickLike();
  
  // Setup video autoplay when in viewport
  setupVideoAutoplay();
  
  // Setup navigation for meme reels
  setupMemeNavigation();
  
  // Track viewed memes for view counts
  setupViewTracking();
  
  // Infinite scroll with intersection observer
  if (memeFeed && loadMoreBtn) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadMoreMemes();
        }
      });
    }, { rootMargin: '200px' });
    
    observer.observe(loadMoreBtn);
  }
  
  /**
   * Setup meme navigation with next/previous buttons
   */
  function setupMemeNavigation() {
    // Get all visible meme items
    let visibleMemes = getVisibleMemes();
    
    // Global navigation buttons
    if (globalPrevBtn) {
      globalPrevBtn.addEventListener('click', () => {
        navigateToMeme('prev');
      });
    }
    
    if (globalNextBtn) {
      globalNextBtn.addEventListener('click', () => {
        navigateToMeme('next');
      });
    }
    
    // Individual meme navigation buttons
    memePrevBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentMeme = this.closest('.reel-item');
        navigateFromMeme(currentMeme, 'prev');
      });
    });
    
    memeNextBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const currentMeme = this.closest('.reel-item');
        navigateFromMeme(currentMeme, 'next');
      });
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        navigateToMeme('prev');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        navigateToMeme('next');
      }
    });
    
    // Navigate to the next or previous meme
    function navigateToMeme(direction) {
      // Update the visible memes as they might have changed due to filtering
      visibleMemes = getVisibleMemes();
      
      if (visibleMemes.length === 0) return;
      
      // Find the current meme in view
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const centerPosition = scrollPosition + (windowHeight / 2);
      
      let currentIndex = 0;
      let closestDistance = Infinity;
      
      visibleMemes.forEach((meme, index) => {
        const rect = meme.getBoundingClientRect();
        const memeCenter = scrollPosition + rect.top + (rect.height / 2);
        const distance = Math.abs(centerPosition - memeCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          currentIndex = index;
        }
      });
      
      // Calculate the target index
      let targetIndex;
      if (direction === 'next') {
        targetIndex = Math.min(visibleMemes.length - 1, currentIndex + 1);
      } else {
        targetIndex = Math.max(0, currentIndex - 1);
      }
      
      // Scroll to the target meme
      if (targetIndex !== currentIndex) {
        visibleMemes[targetIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    
    // Navigate from a specific meme
    function navigateFromMeme(currentMeme, direction) {
      // Update the visible memes
      visibleMemes = getVisibleMemes();
      
      const currentIndex = visibleMemes.indexOf(currentMeme);
      if (currentIndex === -1) return;
      
      let targetIndex;
      if (direction === 'next') {
        targetIndex = Math.min(visibleMemes.length - 1, currentIndex + 1);
      } else {
        targetIndex = Math.max(0, currentIndex - 1);
      }
      
      if (targetIndex !== currentIndex) {
        visibleMemes[targetIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    
    // Get all visible meme items
    function getVisibleMemes() {
      return Array.from(reelItems).filter(meme => {
        return meme.style.display !== 'none';
      });
    }
  }
  
  /**
   * Setup autoplay for videos when they become visible in the viewport
   */
  function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.reel-media-container video');
    if (videos.length === 0) return;
    
    // Create an Intersection Observer to detect when videos are in view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        
        if (entry.isIntersecting) {
          // Attempt to play the video when it becomes visible
          playVideo(video);
          
          // Pause other videos that are not in view
          videos.forEach(otherVideo => {
            if (otherVideo !== video && !otherVideo.paused) {
              otherVideo.pause();
            }
          });
        } else {
          // Pause the video when it's no longer visible
          video.pause();
        }
      });
    }, {
      threshold: 0.7 // Video needs to be 70% visible before playing
    });
    
    // Observe all videos
    videos.forEach(video => {
      videoObserver.observe(video);
      
      // Add click to play/pause functionality
      video.addEventListener('click', (e) => {
        e.preventDefault();
        if (video.paused) {
          playVideo(video);
        } else {
          video.pause();
        }
      });
    });
  }
  
  /**
   * Helper function to play a video with error handling
   */
  function playVideo(video) {
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video started playing successfully
        })
        .catch(error => {
          // Auto-play was prevented
          console.log('Autoplay prevented:', error);
          
          // Add click event to play manually
          video.addEventListener('click', function playHandler() {
            video.play()
              .then(() => {
                video.removeEventListener('click', playHandler);
              })
              .catch(err => console.log('Manual play error:', err));
          }, { once: true });
        });
    }
  }
  
  /**
   * Setup tracking for viewed memes
   */
  function setupViewTracking() {
    const memeItems = document.querySelectorAll('.reel-item');
    if (memeItems.length === 0) return;
    
    // Create an Intersection Observer to detect when memes are fully viewed
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          const memeItem = entry.target;
          const memeId = memeItem.getAttribute('data-id');
          
          // Only count view once per page load
          if (!memeItem.hasAttribute('data-viewed')) {
            incrementMemeView(memeId, memeItem);
          }
        }
      });
    }, {
      threshold: 0.9 // Meme needs to be 90% visible to be considered "viewed"
    });
    
    // Observe all meme items
    memeItems.forEach(meme => {
      viewObserver.observe(meme);
    });
  }
  
  /**
   * Increment view count for a meme
   */
  async function incrementMemeView(memeId, memeElement) {
    try {
      // Mark as viewed to prevent duplicate counts
      memeElement.setAttribute('data-viewed', 'true');
      
      // Send view increment request
      const response = await fetch(`/memes/${memeId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update view count in the UI if there's a view counter
        const viewCountElement = memeElement.querySelector('.view-count');
        if (viewCountElement) {
          viewCountElement.textContent = data.views;
        }
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  }
  
  /**
   * Initialize like buttons
   */
  function initLikeButtons() {
    const likeButtons = document.querySelectorAll('.like-btn');
    
    likeButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const memeId = this.getAttribute('data-id');
        
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
            // Update like count
            const likeCount = this.querySelector('.like-count');
            if (likeCount) {
              likeCount.textContent = data.likes;
            }
            
            // Update UI state
            if (data.hasLiked) {
              this.classList.add('active');
              const icon = this.querySelector('i');
              if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
              }
              
              // Show heart animation
              const memeItem = this.closest('.reel-item');
              if (memeItem) {
                const heartAnimation = memeItem.querySelector('.heart-animation');
                if (heartAnimation) {
                  heartAnimation.style.display = 'block';
                  setTimeout(() => {
                    heartAnimation.style.display = 'none';
                  }, 1000);
                }
              }
              
              showToast('You liked this meme');
            } else {
              this.classList.remove('active');
              const icon = this.querySelector('i');
              if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
              }
              
              showToast('You unliked this meme');
            }
          }
        } catch (error) {
          console.error('Error liking meme:', error);
          showToast('Failed to process your request');
        }
      });
    });
  }
  
  /**
   * Initialize dislike buttons
   */
  function initDislikeButtons() {
    document.querySelectorAll('.dislike-btn').forEach(button => {
      if (!button.hasInitialized) {
        button.hasInitialized = true;
        button.addEventListener('click', async function() {
          const memeId = this.getAttribute('data-id');
          try {
            const response = await fetch(`/memes/${memeId}/dislike`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              }
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Update dislike count
              const dislikesCountElements = document.querySelectorAll(`.meme-post[data-id="${memeId}"] .dislikes-count`);
              dislikesCountElements.forEach(el => {
                el.textContent = data.dislikes;
              });
              
              // Update button state
              const dislikeButtons = document.querySelectorAll(`.dislike-btn[data-id="${memeId}"]`);
              dislikeButtons.forEach(btn => {
                if (data.disliked) {
                  btn.classList.add('active');
                  btn.querySelector('i').className = 'fas fa-thumbs-down';
                } else {
                  btn.classList.remove('active');
                  btn.querySelector('i').className = 'far fa-thumbs-down';
                }
              });
              
              // If disliked, ensure like is removed
              if (data.disliked) {
                const likeButtons = document.querySelectorAll(`.like-btn[data-id="${memeId}"]`);
                likeButtons.forEach(btn => {
                  btn.classList.remove('active');
                  btn.querySelector('i').className = 'far fa-heart';
                });
                
                // Update like count if provided
                if (data.likes !== undefined) {
                  const likesCountElements = document.querySelectorAll(`.meme-post[data-id="${memeId}"] .likes-count`);
                  likesCountElements.forEach(el => {
                    el.textContent = data.likes;
                  });
                }
              }
            }
          } catch (error) {
            console.error('Error disliking meme:', error);
          }
        });
      }
    });
  }
  
  /**
   * Initialize save buttons
   */
  function initSaveButtons() {
    const saveButtons = document.querySelectorAll('.save-btn');
    
    saveButtons.forEach(button => {
      button.addEventListener('click', async function() {
        const memeId = this.getAttribute('data-id');
        
        try {
          const response = await fetch(`/memes/${memeId}/save`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Update UI state
            if (data.hasSaved) {
              this.classList.add('active');
              const icon = this.querySelector('i');
              if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
              }
              showToast('Saved to your collection');
            } else {
              this.classList.remove('active');
              const icon = this.querySelector('i');
              if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
              }
              showToast('Removed from your collection');
            }
          }
        } catch (error) {
          console.error('Error saving meme:', error);
          showToast('Failed to save meme');
        }
      });
    });
  }
  
  /**
   * Initialize share buttons
   */
  function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', function() {
        const memeId = this.getAttribute('data-id');
        
        // Prepare share URL
        const shareUrl = `${window.location.origin}/memes/${memeId}`;
        
        // Set the link in the share modal
        if (shareLink) {
          shareLink.value = shareUrl;
        }
        
        // Open the share modal
        if (shareModal) {
          shareModal.classList.add('open');
        }
      });
    });
    
    // Copy link button
    if (copyLinkBtn && shareLink) {
      copyLinkBtn.addEventListener('click', function() {
        shareLink.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard');
      });
    }
    
    // Social media share buttons
    if (shareTwitter) {
      shareTwitter.addEventListener('click', function() {
        const url = encodeURIComponent(shareLink.value);
        const text = encodeURIComponent('Check out this awesome meme!');
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
      });
    }
    
    if (shareFacebook) {
      shareFacebook.addEventListener('click', function() {
        const url = encodeURIComponent(shareLink.value);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
      });
    }
    
    if (shareReddit) {
      shareReddit.addEventListener('click', function() {
        const url = encodeURIComponent(shareLink.value);
        const title = encodeURIComponent('Check out this awesome meme!');
        window.open(`https://www.reddit.com/submit?url=${url}&title=${title}`, '_blank');
      });
    }
    
    if (shareWhatsapp) {
      shareWhatsapp.addEventListener('click', function() {
        const url = encodeURIComponent(shareLink.value);
        const text = encodeURIComponent('Check out this awesome meme!');
        window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
      });
    }
  }
  
  /**
   * Initialize report buttons
   */
  function initReportButtons() {
    const reportButtons = document.querySelectorAll('.report-btn');
    
    reportButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const memeId = this.getAttribute('data-id');
        
        // Set the meme ID in the report form
        if (reportMemeId) {
          reportMemeId.value = memeId;
        }
        
        // Open the report modal
        if (reportModal) {
          reportModal.classList.add('open');
        }
      });
    });
    
    // Handle report form submission
    if (reportForm) {
      reportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const memeId = reportMemeId.value;
        const reason = reportReasonSelect.value;
        const otherReason = document.getElementById('other-reason')?.value || '';
        
        try {
          const response = await fetch(`/memes/${memeId}/report`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
              reason: reason === 'other' ? otherReason : reason
            })
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Close the modal
            reportModal.classList.remove('open');
            
            // Reset form
            reportForm.reset();
            if (otherReasonGroup) {
              otherReasonGroup.style.display = 'none';
            }
            
            showToast('Report submitted. Thank you for helping keep our community safe.');
          }
        } catch (error) {
          console.error('Error reporting meme:', error);
          showToast('Failed to submit report');
        }
      });
    }
  }
  
  /**
   * Load more memes
   */
  async function loadMoreMemes() {
    if (!loadMoreBtn) return;
    
    const currentPage = parseInt(loadMoreBtn.getAttribute('data-page') || '1');
    const nextPage = currentPage + 1;
    
    try {
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      
      const response = await fetch(`/memes/feed?page=${nextPage}`, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const data = await response.json();
      
      if (data.memes && data.memes.length > 0) {
        // Append memes to the feed
        data.memes.forEach(meme => {
          const memeElement = createMemeElement(meme);
          reelsContainer.appendChild(memeElement);
        });
        
        // Update loadMoreBtn
        loadMoreBtn.setAttribute('data-page', nextPage.toString());
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = 'Load More';
        
        // Re-initialize functionality for new memes
        initLikeButtons();
        initSaveButtons();
        initShareButtons();
        initReportButtons();
        setupVideoAutoplay();
        setupMemeNavigation();
        setupViewTracking();
        setupDoubleClickLike();
        
        // If no more memes
        if (!data.hasMore) {
          loadMoreBtn.style.display = 'none';
        }
      } else {
        loadMoreBtn.innerHTML = 'No more memes';
        loadMoreBtn.disabled = true;
        setTimeout(() => {
          loadMoreBtn.style.display = 'none';
        }, 3000);
      }
    } catch (error) {
      console.error('Error loading more memes:', error);
      loadMoreBtn.innerHTML = 'Try Again';
      loadMoreBtn.disabled = false;
    }
  }
  
  /**
   * Create a meme element from data
   */
  function createMemeElement(meme) {
    const memeElement = document.createElement('div');
    memeElement.className = 'reel-item';
    memeElement.setAttribute('data-id', meme._id);
    memeElement.setAttribute('data-type', meme.mediaType);
    
    if (meme.tags && Array.isArray(meme.tags)) {
      memeElement.setAttribute('data-tags', meme.tags.join(','));
    }
    
    let mediaContent = '';
    if (meme.mediaType === 'image') {
      mediaContent = `<img src="data:${meme.mimeType};base64,${meme.mediaData}" alt="${meme.title}" class="reel-media" loading="lazy">`;
    } else if (meme.mediaType === 'video') {
      mediaContent = `<video src="data:${meme.mimeType};base64,${meme.mediaData}" class="reel-media" autoplay muted loop playsinline controlsList="nodownload"></video>`;
    } else if (meme.mediaType === 'gif') {
      mediaContent = `<img src="data:${meme.mimeType};base64,${meme.mediaData}" alt="${meme.title}" class="reel-media" loading="lazy">`;
    }
    
    memeElement.innerHTML = `
      <div class="reel-content">
        <div class="reel-header">
          <div class="reel-user">
            <a href="/users/profile/${meme.user._id}">
              <div class="reel-user-avatar reel-avatar-image" data-profile-image="${meme.user.profileImage || '/images/default-avatar.png'}"></div>
              <span class="reel-username">${meme.user.name}</span>
            </a>
          </div>
          <div class="reel-options">
            <button class="reel-options-btn" aria-label="More options">
              <i class="fas fa-ellipsis-v"></i>
              <div class="options-dropdown">
                <a href="/memes/${meme._id}" class="option-item">View Details</a>
                <a href="#" class="option-item report-btn" data-id="${meme._id}">Report</a>
                <a href="#" class="option-item share-btn" data-id="${meme._id}">Share</a>
              </div>
            </button>
          </div>
        </div>
        
        <div class="reel-media-container">
          ${mediaContent}
          
          <!-- Double click to like area -->
          <div class="double-click-area">
            <div class="heart-animation">
              <i class="fas fa-heart"></i>
            </div>
          </div>
          
          <!-- Navigation buttons within each meme -->
          <button class="meme-nav prev-meme" aria-label="Previous meme">
            <i class="fas fa-chevron-up"></i>
          </button>
          <button class="meme-nav next-meme" aria-label="Next meme">
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
        
        <div class="reel-info">
          <div class="reel-actions">
            <button class="reel-action like-btn ${meme.isLiked ? 'active' : ''}" data-id="${meme._id}" aria-label="${meme.isLiked ? 'Unlike' : 'Like'}">
              <i class="${meme.isLiked ? 'fas' : 'far'} fa-heart"></i>
              <span class="like-count">${meme.likes}</span>
            </button>
            <button class="reel-action comment-btn" data-id="${meme._id}" aria-label="Comment">
              <i class="far fa-comment"></i>
              <span>${meme.comments ? meme.comments.length : 0}</span>
            </button>
            <button class="reel-action share-btn" data-id="${meme._id}" aria-label="Share">
              <i class="far fa-paper-plane"></i>
            </button>
            <button class="reel-action save-btn ${meme.isSaved ? 'active' : ''}" data-id="${meme._id}" aria-label="${meme.isSaved ? 'Unsave' : 'Save'}">
              <i class="${meme.isSaved ? 'fas' : 'far'} fa-bookmark"></i>
            </button>
          </div>
          
          <div class="reel-details">
            <h3 class="reel-title">${meme.title}</h3>
            ${meme.description ? `<p class="reel-description">${meme.description}</p>` : ''}
            
            <div class="reel-meta">
              <span class="reel-category">
                <i class="fas fa-tag"></i> ${meme.category || meme.mediaType.charAt(0).toUpperCase() + meme.mediaType.slice(1)}
              </span>
              <span class="reel-time">
                <i class="far fa-clock"></i> ${new Date(meme.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            ${meme.likes > 0 ? `
              <div class="liked-by-container">
                <p class="liked-by-text">
                  Liked by <strong>${meme.likes}</strong> ${meme.likes === 1 ? 'person' : 'people'}
                </p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    return memeElement;
  }
  
  /**
   * Setup double-click like functionality
   */
  function setupDoubleClickLike() {
    document.querySelectorAll('.double-click-area').forEach(area => {
      area.addEventListener('dblclick', async function() {
        const memeItem = this.closest('.reel-item');
        const memeId = memeItem.getAttribute('data-id');
        const likeBtn = memeItem.querySelector('.like-btn');
        const likeIcon = likeBtn.querySelector('i');
        const likeCount = likeBtn.querySelector('.like-count');
        const heartAnimation = this.querySelector('.heart-animation');
        
        // Show heart animation
        heartAnimation.style.display = 'block';
        setTimeout(() => {
          heartAnimation.style.display = 'none';
        }, 1000);
        
        // Only like if not already liked
        if (!likeBtn.classList.contains('active')) {
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
              // Update like count
              if (likeCount) {
                likeCount.textContent = data.likes;
              }
              
              // Update button state
              likeBtn.classList.add('active');
              likeIcon.classList.remove('far');
              likeIcon.classList.add('fas');
            }
          } catch (error) {
            console.error('Error liking meme:', error);
          }
        }
      });
    });
  }
  
  /**
   * Show a toast notification
   */
  function showToast(message) {
    let toast = document.getElementById('toast-notification');
    
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      document.body.appendChild(toast);
      
      // Add toast styles if not already present
      if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
          #toast-notification {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 0.9rem;
            opacity: 0;
            transition: opacity 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(4px);
          }
          
          #toast-notification.show {
            opacity: 1;
          }
        `;
        document.head.appendChild(style);
      }
    }
    
    // Set message content
    toast.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}); 