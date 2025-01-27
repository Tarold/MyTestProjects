const setState = (state) => {
  chrome.storage.local.set(state, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving', state, chrome.runtime.lastError);
    } else {
      console.log('State saving');
    }
  });
};
const getState = (state, callback) => chrome.storage.local.get(state, callback);

function saveConnection(videos) {
  getState('savedTabId', (result) => {
    const savedTabId = result.savedTabId;

    if (!savedTabId) return console.log('No saved tab ID found');

    setState({
      connectedTab: { isHaveVideo: !!videos.length, tabId: savedTabId },
    });
  });
}

function localSet(message) {
  getState('savedTabId', ({ savedTabId }) => {
    if (!savedTabId) console.log('No saved tab ID found');

    setState({ message });
  });
}

const statusDiv = document.createElement('div');
statusDiv.style.position = 'absolute';
statusDiv.style.top = '0';
statusDiv.style.left = '0';
statusDiv.style.zIndex = '999999';
statusDiv.textContent = 'u unbelievable o7';

function syncVideo(video, serverStatus) {
  getState('status', (result) => {
    const status = serverStatus ? serverStatus : result.status;
    if (!status) return;
    statusDiv.textContent = JSON.stringify(status);
    if (status.playerStatus === 'INIT') {
      console.log('No saved tab ID found');
    } else if (status.playerStatus === 'PLAYING' && status.second) {
      video.currentTime = status.second;
      video.play();
    } else if (status.playerStatus === 'PAUSE' && status.second) {
      video.currentTime = status.second;
      video.pause();
    }
  });
}

function controlVideoElements(doc, { action, currentTime, status }) {
  const videos = doc.querySelectorAll('video');

  if (videos[0]) {
    // maded for statusDiv mb delete
    videos[0].parentElement.style.position = 'relative';
    videos[0].parentElement.appendChild(statusDiv);
  }

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
                  };

                  chrome.runtime.sendMessage({
                    action: 'play-videos',
                    currentTime: video.currentTime,
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
  statusDiv.textContent = JSON.stringify(message);
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
