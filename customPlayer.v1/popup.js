document.addEventListener('DOMContentLoaded', () => {
  const connectVideosButton = document.getElementById('connect-button');

  connectVideosButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([{ id }]) => {
      chrome.tabs.sendMessage(id, {
        action: 'connect-videos',
      });
      chrome.storage.local.set({ savedTabId: id }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving tab ID:', chrome.runtime.lastError);
        } else {
          console.log('Tab ID saved:', id);
        }
      });
    });
  });

  chrome.storage.local.get('connectedTab', function (result) {
    if (chrome.runtime.lastError) {
      console.error(
        'Error retrieving from chrome.storage.local:',
        chrome.runtime.lastError
      );
    } else {
      const connectedTab = result.connectedTab;
      if (connectedTab) {
        const statusText = document.getElementById('status-text');
        if (statusText) {
          statusText.textContent = `Connected  ${
            connectedTab.isHaveVideo ? 'with' : 'without'
          } video`;
        } else {
          console.error("Element with id 'container' not found.");
        }
      } else {
        console.log('No content found in chrome.storage.local.');
      }
    }
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
