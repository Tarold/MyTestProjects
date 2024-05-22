document.addEventListener('DOMContentLoaded', () => {
  const pauseVideosButton = document.getElementById('pause-videos-button');
  pauseVideosButton.addEventListener('click', () => {
    // Send a message to the content script to pause the videos
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'pause-videos' });
    });
  });
});
