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
                if (
                  currentAction === 'sync-now' ||
                  !currentAction.endsWith('-now')
                ) {
                  const status = {
                    playerStatus: 'PLAYING',
                    second: video.currentTime,
                  };

                  chrome.runtime.sendMessage({
                    action: 'play-videos',
                    currentTime: video.currentTime,
                    status,
                  });
                  setState({
                    currentAction: '',
                    status,
                  });
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

                  setState({
                    currentAction: '',
                    status: {
                      playerStatus: 'PAUSE',
                      second: video.currentTime,
                    },
                  });
                }
              });
            });
            video.addEventListener('waiting', () => {
              chrome.storage.local.get('currentAction', ({ currentAction }) => {
                statusDiv.textContent = statusDiv.textContent + 'waiting\n';
                if (!currentAction.endsWith('-now')) {
                  chrome.runtime.sendMessage({
                    action: 'loading-pause-videos',
                    currentTime: video.currentTime,
                  });

                  setState({
                    currentAction: 'loading-pause-videos',
                    status: {
                      playerStatus: 'PAUSE',
                      second: video.currentTime,
                      isLoading: true,
                    },
                  });
                } else {
                  setState({ currentAction: '' });
                }
              });
            });
            video.addEventListener('playing', () => {
              chrome.storage.local.get('currentAction', ({ currentAction }) => {
                statusDiv.textContent = statusDiv.textContent + 'playing\n';
                if (currentAction === 'loading-pause-videos') {
                  const status = {
                    playerStatus: 'PLAYING',
                    second: video.currentTime,
                  };

                  chrome.runtime.sendMessage({
                    action: 'play-videos',
                    currentTime: video.currentTime,
                    status,
                  });
                  setState({
                    currentAction: '',
                    status,
                  });
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
        case 'sync-now':
          if (status) {
            syncVideo(video, status);
            setState({ status });
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
}

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.action) {
    setTimeout(() => controlVideoElements(document, message), 10);
  }
});
