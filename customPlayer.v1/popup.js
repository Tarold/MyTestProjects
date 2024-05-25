document.addEventListener('DOMContentLoaded', () => {
  const connectVideosButton = document.getElementById('connect-button');

  connectVideosButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
      chrome.tabs.sendMessage(id, {
        action: 'connect-videos',
      });
    });
  });
});

chrome.runtime.onMessage.addListener(({ action }) => {
  const userStatusText = document.getElementById('status-text');

  if (action === 'connection-success') {
    userStatusText.textContent = 'Ready';
  } else if (action === 'connection-error') {
    userStatusText.textContent = 'Error';
  }
});
