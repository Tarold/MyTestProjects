//TODO list
//not working if not refresh page
//Video player status popup not used
//wind video not implemented
//some video players not start video if not start play it manualy
//not to wind to fragment of another page

//aditional todo
//add more info about status
//go to page if someone watch it
//change watch speed?
//if server slepping, wait them to start and reconect

// utils
const setState = (state) => {
  chrome.storage.local.set(state, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving', state, chrome.runtime.lastError);
    } else {
      console.log('State saving');
    }
  });
};
const generateRandomId = (length) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

//program

const userId = generateRandomId(10);
setState({ myId: userId });

let socket;

if (!socket) setState({ webSocketStatus: 'init' });

function setAction(message, tabId) {
  chrome.tabs.sendMessage(tabId, message);
  setState({ currentAction: message.action, initiatorId: message.initiatorId });
}

function setStatusToServer(socket) {
  chrome.storage.local.get('status', ({ status }) => {
    if (status && status.playerStatus !== 'INIT') {
      const message = {
        action: 'set-status',
        status,
        userId,
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
        userId,
      })
    );

    setInterval(() => {
      // add catch if send error to create new connection
      socket.send(
        JSON.stringify({
          action: 'im-alive',
          userId,
        })
      );
    }, 30000);
  }

  function handleOnMessage(event) {
    const message = JSON.parse(event.data);
    console.log('handeMessage', message);
    if (message.action) {
      chrome.storage.local.get(({ savedTabId }) => {
        if (!savedTabId) return console.log('No saved tab ID found');
        if (chrome.runtime.lastError)
          return console.error('Error querying tab:', chrome.runtime.lastError);

        if (message.action === 'sync') {
          setAction(
            {
              action: message.action,
              status: message.status,
              initiatorId: message.userId,
            },
            savedTabId
          );
        } else if (message.action === 'register-succed') {
          if (message.playerStatus !== 'INIT') {
            setAction(
              {
                action: 'sync',
                status: message.status,
                initiatorId: message.userId,
              },
              savedTabId
            );
          } else {
            setStatusToServer(socket);
          }
        } else
          chrome.tabs.sendMessage(savedTabId, {
            action: message.action,
            initiatorId: message.userId,
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
    if (
      ['play-videos', 'pause-videos', 'loading-pause-videos'].includes(
        request.action
      )
    ) {
      chrome.storage.local.get('status', ({ status }) => {
        if (status) {
          const message = {
            action: 'set-status',
            status,
            userId,
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
