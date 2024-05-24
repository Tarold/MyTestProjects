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
