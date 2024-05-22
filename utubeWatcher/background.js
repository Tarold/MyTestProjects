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
    console.log('Received: event.data', event.data);
    const message = JSON.parse(event.data);
    console.log('Received: message', message);

    // Handle space pressed message
    if (message.action === 'space_pressed' && message.funnelId !== funnelId) {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => {
              const video = document.querySelector('video');
              chrome.runtime.sendMessage({ action: 'space_pressed' });
              if (!video) return false;

              if (!message.pause) video.play();
              else video.pause();
              return !video.paused || false;
            },
          },
          (results) => {
            const status = document.getElementById('status');
            if (results[0].result) {
              status.textContent = 'Video is playing';
            } else {
              status.textContent = 'Video is not playing';
            }
          }
        );
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
  console.log('request', request);

  if (
    request.action === 'space_pressed' &&
    socket &&
    socket.readyState === WebSocket.OPEN
  ) {
    // Send a WebSocket message when the space bar is pressed
    const message = {
      pause: true,
      action: 'space_pressed',
      funnelId: funnelId,
    };
    console.log(JSON.stringify(message));
    socket.send(JSON.stringify(message));
  }
});
