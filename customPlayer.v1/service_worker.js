let socket;
let funnelId = generateFunnelId();
let knownFunnelIds = new Set();

function generateFunnelId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function openSocket() {
  socket = new WebSocket('wss://atlantic-boatneck-cloak.glitch.me/');

  function handleOnOpen() {
    console.log('WebSocket is connected. FunnelId:', funnelId);
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
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: message.action,
            currentTime: message.currentTime,
          });
        }
      });
    }
  }

  function handleOnClose() {
    console.log('WebSocket is closed.');
    setTimeout(openSocket, 1000);
  }

  function handleOnError() {
    console.error('WebSocket Error:', error);
    socket.close();
  }

  socket.onopen = handleOnOpen;

  socket.onmessage = handleOnMessage;

  socket.onclose = handleOnClose;

  socket.onerror = handleOnError;
}

openSocket();

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
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  });
});
