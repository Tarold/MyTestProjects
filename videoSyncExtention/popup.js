const setState = (state) => {
  chrome.storage.local.set(state, () => {
    if (chrome.runtime.lastError) {
      console.error('Error saving', state, chrome.runtime.lastError);
    } else {
      console.log('State saving');
    }
  });
};
const getState = (state, callback) => chrome.storage.local.get(state, callback);

const updateStatusText = () => {
  getState(
    ['connectedTab', 'webSocketStatus'],
    ({ connectedTab, webSocketStatus }) => {
      const statusText = document.getElementById('status-text');
      const serverStatusText = document.getElementById('server-status-text');

      const statusToMessage = {
        init: 'off',
        succed: 'on',
        closed: 'closed',
        error: 'error',
      };

      serverStatusText.textContent = statusToMessage[webSocketStatus];

      if (connectedTab) {
        chrome.tabs.get(connectedTab.tabId, function (tab) {
          if (chrome.runtime.lastError) {
            statusText.textContent = 'outdated connection. Connect again';
            console.log(
              'Tab does not exist or an error occurred:',
              chrome.runtime.lastError.message
            );
            return;
          }
          if (tab) {
            if (chrome.runtime.lastError) {
              console.error(
                'Error retrieving from chrome.storage.local:',
                chrome.runtime.lastError
              );
              statusText.textContent = 'Press connect';
              return;
            }
            statusText.textContent = `${
              connectedTab.isHaveVideo
                ? 'Connected with video'
                : 'Connected without video'
            }`;
          }
        });
        return;
      }
      statusText.textContent = `Create connect`;
    }
  );
};

chrome.storage.onChanged.addListener(function () {
  updateStatusText();
});
document.addEventListener('DOMContentLoaded', () => {
  const connectVideosButton = document.getElementById('connect-button');

  updateStatusText('dom loaded');
  connectVideosButton.addEventListener('click', () => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      ([{ id, url }]) => {
        chrome.tabs.sendMessage(id, {
          action: 'connect-videos',
        });
        setState({
          currentAction: '',
          savedTabId: id,
          savedUrl: url,
        });
      }
    );
  });
});
