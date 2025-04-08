document.addEventListener('DOMContentLoaded', function() {
    // Add 'is-loading' class to body
    document.body.classList.add('is-loading');
    
    // Array of humorous loading messages (Discord style)
    const loadingMessages = [
      "Scrubbing barnacles off the server...",
      "Dredging the ocean floor for pixels...",
      "Diving deeper for higher resolution...",
      "Calibrating propellers for optimal streaming...",
      "Adjusting ballast for smooth video playback...",
      "Checking hull integrity before departure...",
      "Training ROVs to capture your attention...",
      "Herding digital sea creatures into formation...",
      "Untangling oceanic fiber cables...",
      "Waking up the underwater cameraman...",
      "Applying digital antifouling coating...",
      "Negotiating with digital mermaids for screen time...",
      "Polishing pixels to maritime standards...",
      "Waiting for digital high tide...",
      "Captain is reviewing the video manifest...",
      "Calculating nautical load times..."
    ];
    
    // Get hero video element
    const heroVideo = document.getElementById('hero-video');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingMessage = document.querySelector('.loading-message');
    const progressBar = document.querySelector('.progress-bar');
    
    // Track loading progress
    let loadingProgress = 0;
    let messageIndex = 0;
    let messageInterval;
  
    // Change loading message every 3 seconds
    function startMessageCycle() {
      // Set initial message
      loadingMessage.textContent = loadingMessages[0];
      
      // Cycle through messages
      messageInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        
        // Fade out current message
        loadingMessage.style.opacity = 0;
        
        setTimeout(() => {
          // Update and fade in new message
          loadingMessage.textContent = loadingMessages[messageIndex];
          loadingMessage.style.opacity = 1;
        }, 300);
        
      }, 3000);
    }
    
    // Start message cycle
    startMessageCycle();
    
    // Generate "fake" progress while the video loads
    function simulateProgress() {
      // We'll simulate progress up to 75%, the real loading will complete the rest
      let fakeProgress = 0;
      
      const progressInterval = setInterval(() => {
        if (fakeProgress < 75) {
          fakeProgress += Math.random() * 5;
          if (fakeProgress > 75) fakeProgress = 75;
          
          updateProgressBar(fakeProgress);
        } else {
          clearInterval(progressInterval);
        }
      }, 500);
    }
    
    // Update progress bar
    function updateProgressBar(progress) {
      progressBar.style.width = `${progress}%`;
    }
    
    // Start simulating progress
    simulateProgress();
    
    // Check if video is already cached
    if (heroVideo.readyState >= 4) {
      // Video is already loaded (from cache likely)
      setTimeout(hideLoadingScreen, 1500); // Still show loading briefly for UX
    } else {
      // Track real video loading progress when possible
      heroVideo.addEventListener('progress', function() {
        if (heroVideo.buffered.length > 0) {
          const bufferedEnd = heroVideo.buffered.end(heroVideo.buffered.length - 1);
          const duration = heroVideo.duration;
          
          if (duration > 0) {
            // Calculate real progress and scale it to 75-100% range
            let realProgress = (bufferedEnd / duration) * 100;
            let scaledProgress = 75 + (realProgress * 0.25);
            
            updateProgressBar(scaledProgress);
            
            // If fully loaded
            if (Math.abs(bufferedEnd - duration) < 0.1) {
              updateProgressBar(100);
              setTimeout(hideLoadingScreen, 500);
            }
          }
        }
      });
      
      // Also listen for canplaythrough as a fallback
      heroVideo.addEventListener('canplaythrough', function() {
        updateProgressBar(100);
        setTimeout(hideLoadingScreen, 800);
      });
      
      // Add a safety timeout (15 seconds max)
      setTimeout(() => {
        if (document.body.classList.contains('is-loading')) {
          updateProgressBar(100);
          hideLoadingScreen();
        }
      }, 15000);
    }
    
    // Hide loading screen and show content
    function hideLoadingScreen() {
      // Stop message cycling
      clearInterval(messageInterval);
      
      // Add completion class for animation
      loadingScreen.classList.add('loading-complete');
      
      // Wait for animation to finish
      setTimeout(() => {
        // Remove loading screen from DOM
        loadingScreen.style.display = 'none';
        
        // Remove is-loading class from body
        document.body.classList.remove('is-loading');
        
        // Start playing the video
        heroVideo.play().catch(err => {
          console.log("Auto-play prevented by browser:", err);
        });
      }, 800);
    }
  });