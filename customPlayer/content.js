function pauseVideoElements(doc) {
  const videos = doc.querySelectorAll('video');
  console.log('Found videos:', videos);

  videos.forEach((video) => {
    try {
      video.pause();
      console.log('Paused video:', video);
    } catch (err) {
      console.error('Failed to pause video:', err);
    }
  });
}

function scanAndPauseVideos() {
  // Pause videos in the main document
  pauseVideoElements(document);

  // Use a MutationObserver to watch for dynamically added videos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'VIDEO') {
          try {
            node.pause();
            console.log('Paused newly added video:', node);
          } catch (err) {
            console.error('Failed to pause newly added video:', err);
          }
        }
        if (node.querySelectorAll) {
          const nestedVideos = node.querySelectorAll('video');
          nestedVideos.forEach((video) => {
            try {
              video.pause();
              console.log('Paused nested video:', video);
            } catch (err) {
              console.error('Failed to pause nested video:', err);
            }
          });
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'pause-videos') {
    // Add some delay to allow dynamic content to load
    setTimeout(scanAndPauseVideos, 10);
  }
});
