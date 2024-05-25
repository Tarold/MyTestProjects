function controlVideoElements(doc, action, currentTime) {
  const videos = doc.querySelectorAll('video');

  videos.forEach((video) => {
    try {
      switch (action) {
        case 'connect':
          video.addEventListener('play', () => {
            chrome.runtime.sendMessage({
              action: 'play-videos',
              currentTime: video.currentTime,
            });
          });
          video.addEventListener('pause', () => {
            chrome.runtime.sendMessage({
              action: 'pause-videos',
            });
          });

          chrome.runtime.sendMessage({
            action: 'connection-success',
          });
          break;
        default:
          if (currentTime) {
            video.currentTime = currentTime;
          }

          video[action]();
          break;
      }
    } catch (err) {
      console.error(`Failed to ${action} video:`, err);
      chrome.runtime.sendMessage({
        action: 'connection-error',
      });
    }
  });

  if (videos.length) console.log('Videos connected: ' + videos.length);
}

chrome.runtime.onMessage.addListener((message) => {
  const actions = {
    'connect-videos': 'connect',
    'play-videos': 'play',
    'pause-videos': 'pause',
  };

  const action = actions[message.action];
  const currentTime = actions[message.currentTime];
  if (action) {
    setTimeout(() => controlVideoElements(document, action, currentTime), 10);
  }
});

// video.addEventListener('ended', () => {
//   console.log('Playback ended');
// });

// video.addEventListener('timeupdate', () => {
//   console.log('Current time:', video.currentTime);
// });

// video.addEventListener('volumechange', () => {
//   console.log('Volume changed:', video.volume);
// });

// video.addEventListener('seeking', () => {
//   console.log('Seeking started');
// });

// video.addEventListener('seeked', () => {
//   console.log('Seeking ended');
// });

// video.addEventListener('loadedmetadata', () => {
//   console.log('Metadata loaded');
// });

// video.addEventListener('canplay', () => {
//   console.log('Can start playing');
// });
// console.log(
//   `${action.charAt(0).toUpperCase() + action.slice(1)}ed video:`,
//   video
// );
