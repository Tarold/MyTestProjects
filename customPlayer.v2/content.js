function controlVideoElements(doc, action) {
  const videos = doc.querySelectorAll('video');
  console.log(`Found videos:`, videos);

  videos.forEach((video) => {
    try {
      video[action]();
      console.log(
        `${action.charAt(0).toUpperCase() + action.slice(1)}ed video:`,
        video
      );
    } catch (err) {
      console.error(`Failed to ${action} video:`, err);
    }
  });
}

function scanAndControlVideos(action) {
  // Control videos in the main document
  controlVideoElements(document, action);

  // Use a MutationObserver to watch for dynamically added videos
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'VIDEO') {
          try {
            node[action]();
            console.log(
              `${
                action.charAt(0).toUpperCase() + action.slice(1)
              }ed newly added video:`,
              node
            );
          } catch (err) {
            console.error(`Failed to ${action} newly added video:`, err);
          }
        }
        if (node.querySelectorAll) {
          const nestedVideos = node.querySelectorAll('video');
          nestedVideos.forEach((video) => {
            try {
              video[action]();
              console.log(
                `${
                  action.charAt(0).toUpperCase() + action.slice(1)
                }ed nested video:`,
                video
              );
            } catch (err) {
              console.error(`Failed to ${action} nested video:`, err);
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
  const actions = {
    'play-videos': 'play',
    'pause-videos': 'pause',
  };

  if (actions[message.action]) {
    // Add some delay to allow dynamic content to load
    setTimeout(() => scanAndControlVideos(actions[message.action]), 10);
  }
});
