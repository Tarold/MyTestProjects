chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js'],
  });
});

// background.js

let socket;
let funnelId = generateFunnelId();
let knownFunnelIds = new Set();

// Function to generate a random funnelId
function generateFunnelId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Function to open a WebSocket connection
function openSocket() {
  socket = new WebSocket('wss://atlantic-boatneck-cloak.glitch.me/');

  socket.onopen = function () {
    console.log('WebSocket is connected. FunnelId:', funnelId);
    // Send the funnelId to the server
    socket.send(
      JSON.stringify({
        action: 'register',
        funnelId: funnelId,
      })
    );
  };

  socket.onmessage = function (event) {
    console.log('Received:', event.data);
    const message = JSON.parse(event.data);
    console.log('Received:', message);

    // Handle space pressed message
    if (message.action && message.funnelId !== funnelId) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: message.action,
          });
        }
      });
    }
  };

  socket.onclose = function () {
    console.log('WebSocket is closed.');
    setTimeout(openSocket, 1000);
  };

  socket.onerror = function (error) {
    console.error('WebSocket Error:', error);
    socket.close();
  };
}

// Open the WebSocket connection when the extension is loaded
openSocket();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    if (request.action === 'play-videos' || request.action === 'pause-videos') {
      const message = {
        action: request.action,
        funnelId: funnelId,
      };
      socket.send(JSON.stringify(message));
    }
  }
});
