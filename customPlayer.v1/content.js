function saveConnection(videos) {
  chrome.storage.local.get('savedTabId', (result) => {
    const savedTabId = result.savedTabId;

    if (savedTabId) {
      chrome.storage.local.set(
        {
          connectedTab: { isHaveVideo: !!videos.length, tabId: savedTabId },
        },
        function () {
          if (chrome.runtime.lastError) {
            console.error(
              'Error saving to chrome.storage.local:',
              chrome.runtime.lastError
            );
          }
        }
      );
    } else {
      console.log('No saved tab ID found');
    }
  });
}

function controlVideoElements(doc, action, currentTime, isMine) {
  const videos = doc.querySelectorAll('video');

  videos.forEach((video) => {
    try {
      switch (action) {
        case 'connect-videos':
          video.addEventListener('play', () => {
            chrome.runtime.sendMessage({
              action: 'play-videos',
              currentTime: video.currentTime,
            });
          });
          video.addEventListener('pause', () => {
            chrome.runtime.sendMessage({
              action: 'pause-videos',
              currentTime: video.currentTime,
            });
          });

          saveConnection(videos);

          chrome.runtime.sendMessage({
            action: 'connection-success',
          });
          break;
        case 'play-videos-now':
        case 'pause-videos-now':
          if (isMine) break;
          if (currentTime) {
            video.currentTime = currentTime;
          }

          const actions = {
            'play-videos-now': 'play',
            'pause-videos-now': 'pause',
          };

          video[actions[action]]();
          break;
        default:
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
  const action = message.action;
  const currentTime = message.currentTime;
  const isMine = message.isMine;

  if (action) {
    setTimeout(
      () => controlVideoElements(document, action, currentTime, isMine),
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
