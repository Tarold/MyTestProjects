let socket;
let funnelId = generateFunnelId();
let knownFunnelIds = new Set();

if (!socket)
  chrome.storage.local.set({ webSocketStatus: 'closed' }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving webSocketStatus:', chrome.runtime.lastError);
    } else {
      console.log('webSocketStatus saved:', 'closed');
    }
  });

function generateFunnelId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function openSocket() {
  socket = new WebSocket('wss://atlantic-boatneck-cloak.glitch.me/');

  function handleOnOpen() {
    console.log('WebSocket is connected. FunnelId:', funnelId);
    chrome.storage.local.set({ webSocketStatus: 'succed' }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving webSocketStatus:',
          chrome.runtime.lastError
        );
      } else {
        console.log('webSocketStatus saved:', 'succed');
      }
    });
    socket.send(
      JSON.stringify({
        action: 'register',
        funnelId: funnelId,
      })
    );
  }

  function handleOnMessage(event) {
    const message = JSON.parse(event.data);
    console.log('Received:', message);

    if (message.action && message.funnelId !== funnelId) {
      chrome.storage.local.get('savedTabId', (result) => {
        const savedTabId = result.savedTabId;

        if (savedTabId) {
          chrome.tabs.get(savedTabId, (tab) => {
            if (chrome.runtime.lastError) {
              console.error('Error querying tab:', chrome.runtime.lastError);
            } else {
              chrome.tabs.sendMessage(tab.id, {
                action: message.action,
                currentTime: message.currentTime,
              });
            }
          });
        } else {
          console.log('No saved tab ID found');
        }
      });
    }
  }

  function handleOnClose() {
    console.log('WebSocket is closed.');
    chrome.storage.local.set({ webSocketStatus: 'closed' }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving webSocketStatus:',
          chrome.runtime.lastError
        );
      } else {
        console.log('webSocketStatus saved:', 'closed');
      }
    });
    socket.close();
  }

  function handleOnError() {
    console.error('WebSocket Error:', error);
    chrome.storage.local.set({ webSocketStatus: 'error' }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error saving webSocketStatus:',
          chrome.runtime.lastError
        );
      } else {
        console.log('webSocketStatus saved:', 'error');
      }
    });
    socket.close();
  }

  socket.onopen = handleOnOpen;

  socket.onmessage = handleOnMessage;

  socket.onclose = handleOnClose;

  socket.onerror = handleOnError;
}

chrome.runtime.onMessage.addListener(function (request) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (request.action === 'play-videos' || request.action === 'pause-videos') {
      const message = {
        action: request.action,
        currentTime: request.currentTime,
        funnelId: funnelId,
      };

      socket.send(JSON.stringify(message));
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
