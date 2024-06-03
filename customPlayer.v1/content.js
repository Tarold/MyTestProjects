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

function localSet(message) {
  chrome.storage.local.get('savedTabId', ({ savedTabId }) => {
    if (savedTabId) {
      chrome.storage.local.set(
        {
          message,
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

function syncVideo(video, serverStatus) {
  chrome.storage.local.get('status', (result) => {
    const status = serverStatus ? serverStatus : result.status;
    if (!status) return;

    if (status.playerStatus !== 'INIT') {
      if (status.playerStatus === 'PLAYING') {
        startTime = new Date(status.actionTime);
        nowTime = new Date();
        const differenceInSeconds = Math.floor((nowTime - startTime) / 1000);
        if (differenceInSeconds < 0) return;
        video.currentTime = status.second + differenceInSeconds;
        video.play();
      }
      if (status.playerStatus === 'PAUSE' && status.second) {
        video.currentTime = status.second;
        video.pause();
      }
    } else {
      console.log('No saved tab ID found');
    }
  });
}

function controlVideoElements(doc, { action, currentTime, status }) {
  const videos = doc.querySelectorAll('video');

  videos.forEach((video) => {
    try {
      switch (action) {
        case 'connect-videos':
          if (!video.dataset.playEventListenerAdded) {
            video.addEventListener('play', () => {
              chrome.storage.local.get('currentAction', ({ currentAction }) => {
                if (!currentAction.endsWith('-now')) {
                  const status = {
                    playerStatus: 'PLAYING',
                    second: video.currentTime,
                    actionTime: new Date().getTime(),
                  };
                  chrome.runtime.sendMessage({
                    action: 'play-videos',
                    currentTime: video.currentTime,
                    actionTime: new Date().getTime(),
                    status,
                  });
                  chrome.storage.local.set(
                    {
                      currentAction: '',
                      status,
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
                }
              });
            });
            video.addEventListener('pause', () => {
              chrome.storage.local.get('currentAction', ({ currentAction }) => {
                if (!currentAction.endsWith('-now')) {
                  chrome.runtime.sendMessage({
                    action: 'pause-videos',
                    currentTime: video.currentTime,
                  });
                  chrome.storage.local.set(
                    {
                      currentAction: '',
                      status: {
                        playerStatus: 'PAUSE',
                        second: video.currentTime,
                        actionTime: new Date().getTime(),
                      },
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
                }
              });
            });
            video.dataset.playEventListenerAdded = 'true';
          }

          syncVideo(video);
          saveConnection(videos);

          chrome.runtime.sendMessage({
            action: 'connection-success',
          });
          break;
        case 'play-videos-now':
        case 'pause-videos-now':
          if (currentTime) {
            video.currentTime = currentTime;
          }

          const actions = {
            'play-videos-now': 'play',
            'pause-videos-now': 'pause',
          };

          video[actions[action]]();
          break;
        case 'sync-now':
          if (status) {
            syncVideo(video, status);
            chrome.storage.local.set(
              { status, currentAction: '' },
              function () {
                if (chrome.runtime.lastError) {
                  console.error(
                    'Error saving to chrome.storage.local:',
                    chrome.runtime.lastError
                  );
                }
              }
            );
          }
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
  if (message && message.action) {
    setTimeout(() => controlVideoElements(document, message), 10);
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
