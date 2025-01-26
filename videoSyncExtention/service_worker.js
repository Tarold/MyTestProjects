const setState = (state) => {
  chrome.storage.local.set(state, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving', state, chrome.runtime.lastError);
    } else {
      console.log('State saving');
    }
  });
};
const getState = (state) => chrome.storage.local.get(state);

let socket;

if (!socket) setState({ webSocketStatus: 'init' });

function setAction(message, tabId) {
  message.action += '-now';
  const { action } = message;

  chrome.tabs.sendMessage(tabId, message);
  setState({ currentAction: action });
}

function setStatusToServer(socket) {
  getState('status').then(({ status }) => {
    if (status && status.playerStatus !== 'INIT') {
      const message = {
        action: 'set-status',
        status,
      };
      socket.send(JSON.stringify(message));
    }
  });
}

function openSocket() {
  socket = new WebSocket('wss://atlantic-boatneck-cloak.glitch.me/');

  function handleOnOpen() {
    setState({ webSocketStatus: 'succed' });

    socket.send(
      JSON.stringify({
        action: 'register',
      })
    );
  }

  function handleOnMessage(event) {
    const message = JSON.parse(event.data);

    if (message.action) {
      getState('savedTabId').then(({ savedTabId }) => {
        if (!savedTabId) return console.log('No saved tab ID found');

        getState(savedTabId).then(({ tab }) => {
          if (chrome.runtime.lastError)
            return console.error(
              'Error querying tab:',
              chrome.runtime.lastError
            );

          if (
            message.action === 'play-videos' ||
            message.action === 'pause-videos'
          ) {
            setAction(
              {
                action: message.action,
                currentTime: message.currentTime,
              },
              tab.id
            );
          } else if (message.action === 'register-succed') {
            if (message.playerStatus !== 'INIT') {
              setAction({ ...message, action: 'sync' }, tab.id);
            } else {
              setStatusToServer(socket);
            }
          } else
            chrome.tabs.sendMessage(tab.id, {
              action: message.action,
            });
        });
      });
    }
  }

  function handleOnClose() {
    socket.close();
    setState({ webSocketStatus: 'closed' });
  }

  function handleOnError() {
    socket.close();
    setState({ webSocketStatus: 'error' });
  }

  socket.onopen = handleOnOpen;

  socket.onmessage = handleOnMessage;

  socket.onclose = handleOnClose;

  socket.onerror = handleOnError;
}

chrome.runtime.onMessage.addListener(function (request) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (request.action === 'play-videos' || request.action === 'pause-videos') {
      getState('status').then(({ status }) => {
        if (status) {
          const message = {
            action: 'set-status',
            status,
          };
          socket.send(JSON.stringify(message));
        }
      });
    }
  } else if (request.action === 'connection-success') {
    openSocket();
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  });
});
