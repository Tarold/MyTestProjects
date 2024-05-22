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

// Add some delay to allow dynamic content to load
setTimeout(scanAndPauseVideos, 3000);
function pauseSameOriginIframes() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    try {
      iframe.contentWindow.postMessage({ action: 'pauseVideos' }, '*');
    } catch (err) {
      console.error('Cannot access iframe content:', err);
    }
  });
}

function pauseVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => video.pause());
}

window.addEventListener('message', (event) => {
  if (event.data.action === 'pauseVideos') {
    pauseVideos();
  }
});

// Initial videos in the main document
pauseVideos();

// MutationObserver for dynamically added content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeName === 'VIDEO') {
        node.pause();
      }
      if (node.nodeName === 'IFRAME') {
        pauseSameOriginIframes();
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

// Pause iframes after a delay
pauseSameOriginIframes();
function pauseVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => video.pause());
}

window.addEventListener('message', (event) => {
  if (event.data.action === 'pauseVideos') {
    pauseVideos();
  }
});
