/**
 * Feed JavaScript - Enhanced Instagram-like Reels Experience
 */

document.addEventListener('DOMContentLoaded', () => {
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
  
  // Setup smooth scrolling for meme reels
  setupSmoothScrolling();
  
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
   * Setup autoplay for videos when they become visible in the viewport
   */
  function setupVideoAutoplay() {
    if (!memeFeed) return;
    
    const videos = memeFeed.querySelectorAll('.meme-post-video');
    if (videos.length === 0) return;
    
    // Create an Intersection Observer to detect when videos are in view
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        const indicator = video.closest('.meme-post-media').querySelector('.video-autoplay-indicator');
        
        if (entry.isIntersecting) {
          // Attempt to play the video when it becomes visible
          playVideo(video, indicator);
          
          // Pause other videos that are not in view
          videos.forEach(otherVideo => {
            if (otherVideo !== video && !otherVideo.paused) {
              otherVideo.pause();
              const otherIndicator = otherVideo.closest('.meme-post-media').querySelector('.video-autoplay-indicator');
              if (otherIndicator) {
                otherIndicator.classList.remove('show');
              }
            }
          });
        } else {
          // Pause the video when it's no longer visible
          video.pause();
          if (indicator) {
            indicator.classList.remove('show');
          }
        }
      });
    }, {
      threshold: 0.7 // Video needs to be 70% visible before playing
    });
    
    // Observe all videos
    videos.forEach(video => {
      videoObserver.observe(video);
      
      // Add click to play/pause functionality
      video.addEventListener('click', () => {
        const indicator = video.closest('.meme-post-media').querySelector('.video-autoplay-indicator');
        if (video.paused) {
          playVideo(video, indicator);
        } else {
          video.pause();
          if (indicator) {
            indicator.classList.add('show');
            indicator.innerHTML = '<i class="fas fa-play"></i>';
          }
        }
      });
    });
  }
  
  /**
   * Helper function to play a video with error handling
   */
  function playVideo(video, indicator) {
    const playPromise = video.play();
    
    // Show loading indicator
    if (indicator) {
      indicator.classList.add('show');
      indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video started playing successfully
          if (indicator) {
            setTimeout(() => {
              indicator.classList.remove('show');
            }, 500);
          }
        })
        .catch(error => {
          // Auto-play was prevented
          console.log('Autoplay prevented:', error);
          if (indicator) {
            indicator.classList.add('show');
            indicator.innerHTML = '<i class="fas fa-play"></i>';
          }
          
          // Add click event to play manually
          video.addEventListener('click', function playHandler() {
            video.play()
              .then(() => {
                if (indicator) {
                  indicator.classList.remove('show');
                }
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
    if (!memeFeed) return;
    
    const posts = memeFeed.querySelectorAll('.meme-post');
    if (posts.length === 0) return;
    
    // Create an Intersection Observer to detect when posts are fully viewed
    const viewObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
          const post = entry.target;
          const memeId = post.getAttribute('data-id');
          
          // Only count view once per page load
          if (!post.hasAttribute('data-viewed')) {
            incrementMemeView(memeId, post);
          }
        }
      });
    }, {
      threshold: 0.9 // Post needs to be 90% visible to be considered "viewed"
    });
    
    // Observe all posts
    posts.forEach(post => {
      viewObserver.observe(post);
    });
  }
  
  /**
   * Increment view count for a meme
   */
  async function incrementMemeView(memeId, postElement) {
    try {
      // Mark as viewed to prevent duplicate counts
      postElement.setAttribute('data-viewed', 'true');
      
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
        // Update view count in the UI
        const viewsElement = postElement.querySelector('.meme-post-stat:nth-child(3) span');
        if (viewsElement) {
          viewsElement.textContent = data.views;
        }
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
    }
  }
  
  /**
   * Setup smooth scrolling for reels
   */
  function setupSmoothScrolling() {
    if (!memeFeed) return;
    
    // Get all meme posts
    const posts = Array.from(memeFeed.querySelectorAll('.meme-post'));
    if (posts.length === 0) return;
    
    // Smooth scroll to the next or previous post
    function scrollToPost(direction) {
      // Get current scroll position
      const currentScrollPos = memeFeed.scrollTop;
      const viewportHeight = window.innerHeight;
      
      // Find the current post in view
      let currentPostIndex = 0;
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postTop = post.offsetTop;
        
        if (currentScrollPos < postTop + viewportHeight / 2) {
          currentPostIndex = Math.max(0, i - 1);
          break;
        }
      }
      
      // Calculate target post
      let targetIndex = direction === 'next' 
        ? Math.min(posts.length - 1, currentPostIndex + 1)
        : Math.max(0, currentPostIndex - 1);
      
      const targetPost = posts[targetIndex];
      if (targetPost) {
        targetPost.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToPost('next');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToPost('prev');
      }
    });
    
    // Handle swipe navigation on mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    memeFeed.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    memeFeed.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const distance = touchStartY - touchEndY;
      const isSwipeDown = distance > 50;
      const isSwipeUp = distance < -50;
      
      if (isSwipeDown) {
        scrollToPost('next');
      } else if (isSwipeUp) {
        scrollToPost('prev');
      }
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
            const likesCount = this.closest('.meme-post').querySelector('.likes-count');
            const dislikesCount = this.closest('.meme-post').querySelector('.dislikes-count');
            
            if (likesCount) likesCount.textContent = data.likes;
            if (dislikesCount) dislikesCount.textContent = data.dislikes;
            
            // Update like button state
            if (data.hasLiked) {
              this.classList.add('active');
              this.querySelector('i').classList.remove('far');
              this.querySelector('i').classList.add('fas');
            } else {
              this.classList.remove('active');
              this.querySelector('i').classList.remove('fas');
              this.querySelector('i').classList.add('far');
            }
            
            // Update dislike button state
            const dislikeBtn = this.closest('.meme-post').querySelector('.dislike-btn');
            if (dislikeBtn) {
              if (data.hasDisliked) {
                dislikeBtn.classList.add('active');
                dislikeBtn.querySelector('i').classList.remove('far');
                dislikeBtn.querySelector('i').classList.add('fas');
              } else {
                dislikeBtn.classList.remove('active');
                dislikeBtn.querySelector('i').classList.remove('fas');
                dislikeBtn.querySelector('i').classList.add('far');
              }
            }
            
            // Update liked by information
            if (data.likedBy) {
              updateLikedByInfo(this.closest('.meme-post'), data.likedBy);
            }
          }
        } catch (error) {
          console.error('Error liking meme:', error);
        }
      });
    });
  }
  
  /**
   * Update the liked by information section with new data
   */
  function updateLikedByInfo(postElement, likedByUsers) {
    if (!postElement) return;
    
    let likedByContainer = postElement.querySelector('.liked-by-container');
    const postInfo = postElement.querySelector('.meme-post-info');
    
    // If there's no liked by data or it's empty, remove the container
    if (!likedByUsers || likedByUsers.length === 0) {
      if (likedByContainer) {
        likedByContainer.remove();
      }
      return;
    }
    
    // If the container doesn't exist, create it
    if (!likedByContainer) {
      likedByContainer = document.createElement('div');
      likedByContainer.className = 'liked-by-container';
      
      // Find where to insert the liked-by container (after actions, before tags)
      const actionsEl = postElement.querySelector('.meme-post-actions');
      const tagsEl = postElement.querySelector('.meme-post-tags');
      
      if (actionsEl) {
        if (tagsEl) {
          postInfo.insertBefore(likedByContainer, tagsEl);
        } else {
          postInfo.appendChild(likedByContainer);
        }
      }
    }
    
    // Create the preview part (avatars)
    let likedByPreview = likedByContainer.querySelector('.liked-by-preview');
    if (!likedByPreview) {
      likedByPreview = document.createElement('div');
      likedByPreview.className = 'liked-by-preview';
      likedByContainer.appendChild(likedByPreview);
    }
    
    // Clear existing preview
    likedByPreview.innerHTML = '';
    
    // Add up to 3 avatars
    likedByUsers.slice(0, 3).forEach(user => {
      const img = document.createElement('img');
      img.src = user.profileImage;
      img.alt = user.name;
      img.title = user.name;
      img.className = 'liked-by-avatar';
      likedByPreview.appendChild(img);
    });
    
    // Add +X more if needed
    if (likedByUsers.length > 3) {
      const moreSpan = document.createElement('span');
      moreSpan.className = 'liked-by-more';
      moreSpan.textContent = `+${likedByUsers.length - 3}`;
      likedByPreview.appendChild(moreSpan);
    }
    
    // Create the text part
    let likedByText = likedByContainer.querySelector('.liked-by-text');
    if (!likedByText) {
      likedByText = document.createElement('div');
      likedByText.className = 'liked-by-text';
      likedByContainer.appendChild(likedByText);
    }
    
    // Build the text based on number of likes
    let textContent = '';
    if (likedByUsers.length === 1) {
      textContent = `Liked by <a href="/users/profile/${likedByUsers[0]._id}">${likedByUsers[0].name}</a>`;
    } else if (likedByUsers.length === 2) {
      textContent = `Liked by <a href="/users/profile/${likedByUsers[0]._id}">${likedByUsers[0].name}</a> and <a href="/users/profile/${likedByUsers[1]._id}">${likedByUsers[1].name}</a>`;
    } else if (likedByUsers.length === 3) {
      textContent = `Liked by <a href="/users/profile/${likedByUsers[0]._id}">${likedByUsers[0].name}</a>, <a href="/users/profile/${likedByUsers[1]._id}">${likedByUsers[1].name}</a>, and <a href="/users/profile/${likedByUsers[2]._id}">${likedByUsers[2].name}</a>`;
    } else {
      textContent = `Liked by <a href="/users/profile/${likedByUsers[0]._id}">${likedByUsers[0].name}</a>, <a href="/users/profile/${likedByUsers[1]._id}">${likedByUsers[1].name}</a>, and ${likedByUsers.length - 2} others`;
    }
    
    likedByText.innerHTML = textContent;
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
            // Update save button state
            if (data.hasSaved) {
              this.classList.add('active');
              this.querySelector('i').classList.remove('far');
              this.querySelector('i').classList.add('fas');
              showToast('Meme saved to your collection');
            } else {
              this.classList.remove('active');
              this.querySelector('i').classList.remove('fas');
              this.querySelector('i').classList.add('far');
              showToast('Meme removed from your collection');
            }
          }
        } catch (error) {
          console.error('Error saving meme:', error);
        }
      });
    });
  }
  
  /**
   * Initialize share buttons
   */
  function initShareButtons() {
    document.querySelectorAll('.share-btn').forEach(button => {
      if (!button.hasInitialized) {
        button.hasInitialized = true;
        button.addEventListener('click', async function() {
          const memeId = this.getAttribute('data-id');
          const memeTitle = this.getAttribute('data-title');
          
          // Increment share count
          try {
            const response = await fetch(`/memes/${memeId}/share`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              }
            });
            
            const data = await response.json();
            
            if (data.success) {
              // Update share count in UI
              const sharesCountElements = document.querySelectorAll(`.meme-post[data-id="${memeId}"] .shares-count`);
              sharesCountElements.forEach(el => {
                el.textContent = data.shares;
              });
              
              // Prepare share modal
              const shareUrl = `${window.location.origin}/memes/${memeId}`;
              
              if (shareLink) {
                shareLink.value = shareUrl;
              }
              
              // Show share modal
              if (shareModal) {
                shareModal.classList.add('open');
              } else {
                // Fallback to navigator.share if available (mobile devices)
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: memeTitle,
                      text: `Check out this meme: ${memeTitle}`,
                      url: shareUrl
                    });
                  } catch (err) {
                    console.log('Share canceled or failed');
                  }
                } else {
                  // Fallback to clipboard
                  navigator.clipboard.writeText(shareUrl)
                    .then(() => {
                      alert('Link copied to clipboard!');
                    })
                    .catch(err => {
                      console.error('Could not copy link: ', err);
                    });
                }
              }
            }
          } catch (error) {
            console.error('Error sharing meme:', error);
          }
        });
      }
    });
    
    // Copy link button
    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        if (shareLink) {
          shareLink.select();
          document.execCommand('copy');
          
          copyLinkBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
          }, 2000);
        }
      });
    }
  }
  
  /**
   * Initialize report buttons
   */
  function initReportButtons() {
    document.querySelectorAll('.report-btn').forEach(button => {
      if (!button.hasInitialized) {
        button.hasInitialized = true;
        button.addEventListener('click', function() {
          const memeId = this.getAttribute('data-id');
          
          if (reportMemeId) {
            reportMemeId.value = memeId;
          }
          
          if (reportModal) {
            reportModal.classList.add('open');
          }
        });
      }
    });
    
    // Submit report form
    if (reportForm) {
      reportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
          formObject[key] = value;
        });
        
        try {
          const response = await fetch('/memes/report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(formObject)
          });
          
          const data = await response.json();
          
          if (data.success) {
            // Close modal
            reportModal.classList.remove('open');
            
            // Reset form
            reportForm.reset();
            if (otherReasonGroup) {
              otherReasonGroup.style.display = 'none';
            }
            
            // Show success message
            alert('Report submitted successfully. Thank you for helping keep our platform safe.');
          } else {
            alert(data.message || 'Failed to submit report. Please try again.');
          }
        } catch (error) {
          console.error('Error reporting meme:', error);
          alert('An error occurred. Please try again later.');
        }
      });
    }
  }
  
  /**
   * Load more memes
   */
  async function loadMoreMemes() {
    try {
      if (loadMoreBtn) {
        const page = loadMoreBtn.getAttribute('data-page');
        if (!page) return;
        
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        
        // Get the current media type from URL or active tab
        const urlParams = new URLSearchParams(window.location.search);
        let mediaType = urlParams.get('type') || 'all';
        
        // If we're on a category-specific page, use that media type
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart === 'images') mediaType = 'image';
        if (lastPart === 'gifs') mediaType = 'gif';
        if (lastPart === 'reels') mediaType = 'video';
        
        const response = await fetch(`/memes/feed?page=${page}&type=${mediaType}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        const data = await response.json();
        
        if (data.memes && data.memes.length > 0) {
          data.memes.forEach(meme => {
            appendMemeToFeed(meme);
          });
          
          // Update load more button
          if (data.hasMore) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner"></i> Load More';
            loadMoreBtn.setAttribute('data-page', data.nextPage);
          } else {
            loadMoreBtn.disabled = true;
            loadMoreBtn.innerHTML = 'No more memes';
            // Hide after a delay
            setTimeout(() => {
              loadMoreBtn.closest('.load-more-container').style.display = 'none';
            }, 2000);
          }
          
          // Initialize newly added memes
          initLikeButtons();
          initDislikeButtons();
          initSaveButtons();
          initShareButtons();
          initReportButtons();
          setupVideoAutoplay();
          setupViewTracking();
        } else {
          loadMoreBtn.disabled = true;
          loadMoreBtn.innerHTML = 'No more memes';
          // Hide after a delay
          setTimeout(() => {
            loadMoreBtn.closest('.load-more-container').style.display = 'none';
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error loading more memes:', error);
      if (loadMoreBtn) {
        loadMoreBtn.disabled = false;
        loadMoreBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error. Try Again';
      }
    }
  }
  
  /**
   * Show a toast notification
   */
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
  
  // Add double-click to like functionality
  function setupDoubleClickLike() {
    const memePosts = document.querySelectorAll('.meme-post');
    
    memePosts.forEach(post => {
      const mediaContainer = post.querySelector('.meme-post-media');
      const memeId = post.getAttribute('data-id');
      
      // Create a heart animation element
      const heartAnimation = document.createElement('div');
      heartAnimation.className = 'heart-animation';
      heartAnimation.innerHTML = '<i class="fas fa-heart"></i>';
      mediaContainer.appendChild(heartAnimation);
      
      // Add double click event listener
      mediaContainer.addEventListener('dblclick', async function(e) {
        e.preventDefault();
        
        // Play heart animation
        heartAnimation.classList.add('active');
        
        // Find the like button for this post
        const likeBtn = post.querySelector('.like-btn');
        const likesCount = post.querySelector('.likes-count');
        
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
              if (likesCount) likesCount.textContent = data.likes;
              
              // Update like button state
              likeBtn.classList.add('active');
              likeBtn.querySelector('i').classList.remove('far');
              likeBtn.querySelector('i').classList.add('fas');
              
              // Update dislike button state if needed
              const dislikeBtn = post.querySelector('.dislike-btn');
              if (dislikeBtn && dislikeBtn.classList.contains('active')) {
                dislikeBtn.classList.remove('active');
                dislikeBtn.querySelector('i').classList.remove('fas');
                dislikeBtn.querySelector('i').classList.add('far');
                
                const dislikesCount = post.querySelector('.dislikes-count');
                if (dislikesCount) dislikesCount.textContent = data.dislikes;
              }
              
              // Update liked by information
              if (data.likedBy) {
                updateLikedByInfo(post, data.likedBy);
              }
            }
          } catch (error) {
            console.error('Error liking meme:', error);
          }
        }
        
        // Remove the animation class after animation completes
        setTimeout(() => {
          heartAnimation.classList.remove('active');
        }, 1000);
      });
    });
  }
}); 