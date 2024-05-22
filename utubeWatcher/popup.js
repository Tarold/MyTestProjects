document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const video = document.querySelector('video');
          chrome.runtime.sendMessage({ action: 'space_pressed' });

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
});
