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

const logsActions = [];
let timeoutId;

const setPlay = (video) => {
  chrome.storage.local.get(({ currentAction, initiatorId, myId }) => {
    statusDiv.textContent =
      statusDiv.textContent + 'INFO' + currentAction + initiatorId + '/' + myId;
    ('INFOplay');
    if (currentAction !== 'sync' && initiatorId !== myId) {
      const masterStatus = {
        playerStatus: 'PLAYING',
        second: video.currentTime,
      };

      setState({
        currentAction: '',
        initiatorId: '',
        status: masterStatus,
      });

      chrome.runtime.sendMessage({
        action: 'play-videos',
        status: masterStatus,
      });
    } else {
      setState({
        currentAction: '',
        initiatorId: '',
      });
    }
  });
};

const setPause = (video) => {
  chrome.storage.local.get(({ myId, currentAction }) => {
    if (currentAction !== 'sync' && myId !== message.initiatorId) {
      const masterStatus = {
        playerStatus: 'PAUSE',
        second: video.currentTime,
      };

      setState({
        currentAction: '',
        initiatorId: '',
        status: masterStatus,
      });

      chrome.runtime.sendMessage({
        action: 'pause-videos',
        status: masterStatus,
      });
    } else {
      setState({
        currentAction: '',
        initiatorId: '',
      });
    }
  });
};

const setWaiting = (video) => {
  chrome.storage.local.get(({ currentAction }) => {
    if (currentAction !== 'sync') {
      const masterStatus = {
        playerStatus: 'PAUSE',
        second: video.currentTime,
        isLoading: true,
      };

      setState({
        currentAction: 'loading-pause-videos',
        status: masterStatus,
      });

      chrome.runtime.sendMessage({
        action: 'loading-pause-videos',
        status: masterStatus,
      });
    }
  });
};

const setPlaying = (video) => {
  chrome.storage.local.get('currentAction', ({ currentAction }) => {
    if (currentAction === 'loading-pause-videos') {
      const masterStatus = {
        playerStatus: 'PLAYING',
        second: video.currentTime,
      };

      setState({
        currentAction: '',
        initiatorId: '',
        status: masterStatus,
      });

      chrome.runtime.sendMessage({
        action: 'play-videos',
        status: masterStatus,
      });
    }
  });
  setState({
    currentAction: '',
    initiatorId: '',
    isRewind: false,
  });
};

function startTimeout(video) {
  logsActions.length = 0;
  timeoutId = setTimeout(() => {
    const isIncluded = (array1, array2) =>
      array2.every((item) => array1.includes(item));
    statusDiv.textContent = statusDiv.textContent + JSON.stringify(logsActions);
    if (isIncluded(logsActions, ['pause', 'seeking', 'play'])) {
      setPlay(video);
    } else if (isIncluded(logsActions, ['pause'])) {
      setPause(video);
    }
    timeoutId = undefined;
  }, 100);
}

function controlVideoElements(doc, { action, status }) {
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
              statusDiv.textContent =
                statusDiv.textContent + (timeoutId !== undefined) + 'play';
              if (timeoutId !== undefined) {
                logsActions.push('play');
                return;
              }

              setPlay(video);
            });
            video.addEventListener('pause', () => {
              if (timeoutId !== undefined) {
                clearTimeout(timeoutId);
              }
              startTimeout(video);

              logsActions.push('pause');
            });
            video.addEventListener('seeking', () => {
              if (timeoutId !== undefined) {
                logsActions.push('seeking');
                return;
              }
              setPause(video);
            });
            video.addEventListener('waiting', () => {
              if (timeoutId !== undefined) {
                logsActions.push('waiting');
                return;
              }
              setWaiting(video);
            });
            video.addEventListener('playing', () => {
              if (timeoutId !== undefined) {
                logsActions.push('playing');
                return;
              }
              setPlaying(video);
            });
            video.dataset.playEventListenerAdded = 'true';
          }

          syncVideo(video);
          saveConnection(videos);

          chrome.runtime.sendMessage({
            action: 'connection-success',
          });
          break;
        case 'sync':
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
  if (!message) return;

  setTimeout(() => controlVideoElements(document, message), 10);
});
