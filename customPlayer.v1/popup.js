document.addEventListener('DOMContentLoaded', () => {
  const connectVideosButton = document.getElementById('connect-button');
  connectVideosButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'connect-videos',
        tabID: tabs[0].id,
      });
    });
  });
});
