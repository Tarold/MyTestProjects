window.addEventListener('load', () => {
  const videos = document.querySelectorAll('video');
  console.log('wideos', videos);
});

function controlVideoElements(doc, action, tabID) {
  const videos = doc.querySelectorAll('video');
  console.log(`Found videos:`, videos);

  videos.forEach((video) => {
    try {
      if (action === 'connect') {
        video.addEventListener('play', () => {
          chrome.runtime.sendMessage({
            action: 'play-videos',
          });
        });
        video.addEventListener('pause', () => {
          chrome.runtime.sendMessage({
            action: 'pause-videos',
          });
        });
      } else video[action]();
    } catch (err) {
      console.error(`Failed to ${action} video:`, err);
    }
  });
}

chrome.runtime.onMessage.addListener((message) => {
  const actions = {
    'connect-videos': 'connect',
    'play-videos': 'play',
    'pause-videos': 'pause',
  };

  if (actions[message.action]) {
    setTimeout(
      () =>
        controlVideoElements(document, actions[message.action], message.tabID),
      10
    );
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
